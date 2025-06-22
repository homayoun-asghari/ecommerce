import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { Row, Col, Card, Spinner, Button, Badge, Container } from 'react-bootstrap';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import styled from 'styled-components';
import '../styles/Blog.css';
import { useSideBar } from "../contexts/SideBarContext";

const ContentColumn = styled(Col)`
  transition: all 0.3s ease-in-out;
  margin-left: 0;
  width: 100%;
  padding: 0 15px;
  
  @media (min-width: 992px) {
    margin-left: ${({ $isOpen }) => ($isOpen ? '300px' : '0')};
    width: ${({ $isOpen }) => ($isOpen ? 'calc(100% - 300px)' : '100%')};
  }
`;

function BlogPost() {
    const { t, i18n } = useTranslation('blogPost');
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const { mode } = useTheme();
    const { isOpen } = useSideBar();

    // Format date according to current language
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(i18n.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);

                // Fetch the current post
                console.log('Fetching post with ID:', id);
                const postResponse = await fetch(`${API_BASE_URL}/admin/blog?id=${id}`);
                if (!postResponse.ok) {
                    const errorData = await postResponse.text();
                    console.error('Error response:', errorData);
                    throw new Error(`Failed to fetch post: ${postResponse.status} ${postResponse.statusText}`);
                }
                const postData = await postResponse.json();
                console.log('Received post data:', postData);
                
                // Handle different possible response structures
                let post;
                if (Array.isArray(postData)) {
                    // If the response is an array, take the first item
                    [post] = postData;
                } else if (postData.posts && Array.isArray(postData.posts)) {
                    // If the response has a posts array
                    [post] = postData.posts;
                } else if (postData.id) {
                    // If the response is the post object directly
                    post = postData;
                }
                
                if (!post) {
                    console.error('Post not found in response:', postData);
                    throw new Error(t('postNotFoundInResponse'));
                }
                
                console.log('Setting post:', post);
                setPost(post);

                // Fetch related posts (by the same author or similar tags)
                const relatedResponse = await fetch(`${API_BASE_URL}/admin/blog?author_id=${post.author_id}&limit=3`);
                if (relatedResponse.ok) {
                    const relatedData = await relatedResponse.json();
                    // Filter out the current post from related posts
                    setRelatedPosts(relatedData.posts.filter(p => p.id !== parseInt(id)));
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching blog post:', err);
                setError(t('loadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col xs="auto" className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">{t('loading')}</span>
                        </Spinner>
                        <p className="mt-2">{t('loadingPost')}</p>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (error || !post) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} className="text-center">
                        <Card className="border-danger">
                            <Card.Body>
                                <Card.Title className="text-danger">{t('errorTitle')}</Card.Title>
                                <Card.Text>{error || t('postNotFound')}</Card.Text>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => navigate('/blog')}
                                    className="mt-2"
                                >
                                    {t('backToBlog')}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4 px-0 px-md-3">
            <Row className="position-relative">
                <ContentColumn $isOpen={isOpen}>
                    <div className="py-4">
                        <Button
                            variant={mode === 'dark' ? 'outline-light' : 'outline-secondary'}
                            onClick={() => navigate(-1)}
                            className="mb-4"
                            size="sm"
                        >
                            <i className="bi bi-arrow-left me-2"></i>{t('backToAllPosts')}
                        </Button>
                    </div>

                    <article>
                        <header className="mb-5">
                            <h1 className="display-4 fw-bold mb-3">{post.title}</h1>
                            <div className="d-flex flex-wrap align-items-center text-muted mb-3">
                                <div className="me-3">
                                    <i className="bi bi-calendar3 me-1"></i>
                                    {format(new Date(post.created_at), 'MMMM d, yyyy')}
                                </div>
                                {post.author_name && (
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-person me-1"></i>
                                        {post.author_name}
                                    </div>
                                )}
                            </div>
                            {post.tags && (
                                <div className="mb-3">
                                    {post.tags.split(',').map((tag, index) => (
                                        <Badge
                                            key={index}
                                            bg={mode === 'dark' ? 'light' : 'secondary'}
                                            className="me-2"
                                        >
                                            {tag.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </header>

                        {post.image_url && (
                            <figure className="mb-4">
                                <img
                                    className="img-fluid rounded"
                                    src={post.image_url}
                                    alt={post.title}
                                    style={{ maxHeight: '500px', width: '100%', objectFit: 'cover' }}
                                />
                            </figure>
                        )}

                        <section className="mb-5">
                            <div className="blog-content-wrapper">
                                <div
                                    className="blog-content"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            </div>
                        </section>
                    </article>

                    {relatedPosts.length > 0 && (
                        <section className="mt-5 pt-5 border-top">
                            <h3 className="mb-4 pb-2 border-bottom">{t('youMightAlsoLike')}</h3>
                            <Row xs={1} md={2} lg={3} className="g-4">
                                {relatedPosts.map((relatedPost) => (
                                    <Col key={relatedPost.id}>
                                        <Card className="h-100">
                                            {relatedPost.image_url && (
                                                <Card.Img
                                                    variant="top"
                                                    src={relatedPost.image_url}
                                                    alt={relatedPost.title}
                                                    style={{ height: '160px', objectFit: 'cover' }}
                                                />
                                            )}
                                            <Card.Body>
                                                <Card.Title>{relatedPost.title}</Card.Title>
                                                <Card.Text className="text-muted small">
                                                    {formatDate(relatedPost.created_at)}
                                                </Card.Text>
                                                <Button
                                                    variant={mode === 'dark' ? 'outline-light' : 'outline-primary'}
                                                    size="sm"
                                                    onClick={() => navigate(`/blog/${relatedPost.id}`)}
                                                >
                                                    {t('readMore')}
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </section>
                    )}
                </ContentColumn>
            </Row>
        </Container>
    );
}

export default BlogPost;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Button, Badge } from 'react-bootstrap';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Blog.css';
import { useSideBar } from "../contexts/SideBarContext";

function BlogPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const { mode } = useTheme();
    const { isOpen } = useSideBar();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);

                // Fetch the current post
                const postResponse = await fetch(`http://localhost:5050/admin/blog?id=${id}`);
                if (!postResponse.ok) {
                    throw new Error('Post not found');
                }
                const postData = await postResponse.json();
                // Get the first post from the array since we're querying by ID
                const [post] = postData.posts || [];
                if (!post) throw new Error('Post not found');
                setPost(post);

                // Fetch related posts (by the same author or similar tags)
                const relatedResponse = await fetch(`http://localhost:5050/admin/blog?author_id=${post.author_id}&limit=3`);
                if (relatedResponse.ok) {
                    const relatedData = await relatedResponse.json();
                    // Filter out the current post from related posts
                    setRelatedPosts(relatedData.posts.filter(p => p.id !== parseInt(id)));
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching blog post:', err);
                setError('Failed to load blog post. It may have been removed or does not exist.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <Row>
                <Col lg={isOpen ? 3 : 0}></Col>
                <Col lg={isOpen ? 9 : 12}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2">Loading post...</p>
                </Col>
            </Row>
        );
    }

    if (error || !post) {
        return (
            <Row>
                <Col lg={isOpen ? 3 : 0}></Col>
                <Col lg={isOpen ? 9 : 12}>
                    <div className="alert alert-danger">{error || 'Post not found'}</div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/blog')}
                        className="mt-3"
                    >
                        Back to Blog
                    </Button>
                </Col>
            </Row>
        );
    }

    return (
        <Row>
            <Col lg={isOpen ? 3 : 0}></Col>
            <Col lg={isOpen ? 9 : 12}>
                <Button
                    variant={mode === 'dark' ? 'outline-light' : 'outline-secondary'}
                    onClick={() => navigate(-1)}
                    className="mb-4"
                    size="sm"
                >
                    <i className="bi bi-arrow-left me-2"></i>Back to all posts
                </Button>

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
                        <h3 className="mb-4 pb-2 border-bottom">You might also like</h3>
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
                                                {format(new Date(relatedPost.created_at), 'MMMM d, yyyy')}
                                            </Card.Text>
                                            <Button
                                                variant={mode === 'dark' ? 'outline-light' : 'outline-primary'}
                                                size="sm"
                                                onClick={() => navigate(`/blog/${relatedPost.id}`)}
                                            >
                                                Read more
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </section>
                )}
            </Col>
        </Row>
    );
}

export default BlogPost;

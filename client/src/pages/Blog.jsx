import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Blog.css';
import { useSideBar } from "../contexts/SideBarContext";

function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { mode } = useTheme();
    const postsPerPage = 6;
    const { isOpen } = useSideBar();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5050/admin/blog?page=${page}&limit=${postsPerPage}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch blog posts');
                }

                const data = await response.json();

                if (page === 1) {
                    setPosts(data.posts);
                } else {
                    setPosts(prevPosts => [...prevPosts, ...data.posts]);
                }

                setHasMore(data.posts.length === postsPerPage);
                setError(null);
            } catch (err) {
                console.error('Error fetching blog posts:', err);
                setError('Failed to load blog posts. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [page]);

    const loadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

    if (loading && page === 1) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading blog posts...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5 text-center">
                <div className="alert alert-danger">{error}</div>
                <Button
                    variant="primary"
                    onClick={() => window.location.reload()}
                    className="mt-3"
                >
                    Retry
                </Button>
            </Container>
        );
    }

    return (
        <Row>
            <Col lg={isOpen ? 3 : 0}></Col>
            <Col lg={isOpen ? 9 : 12}>
                {posts.length === 0 ? (
                    <div className="text-center py-5 my-5">
                        <i className="bi bi-newspaper" style={{ fontSize: '4rem', opacity: 0.2 }}></i>
                        <h3 className="mt-3">No blog posts found</h3>
                        <p className="text-muted mb-4">Check back later for new posts!</p>
                        <Button
                            variant="primary"
                            onClick={() => window.location.reload()}
                        >
                            Refresh
                        </Button>
                    </div>
                ) : (
                    <>
                        <Row xs={1} md={2} lg={3} className="g-4 mb-4">
                            {posts.map((post) => (
                                <Col key={post.id}>
                                    <Card className="h-100 shadow-sm">
                                        {post.image_url && (
                                            <Card.Img
                                                variant="top"
                                                src={post.image_url}
                                                alt={post.title}
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                        )}
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Subtitle className="mb-2 text-muted">
                                                {format(new Date(post.created_at), 'MMMM d, yyyy')}
                                            </Card.Subtitle>
                                            <Card.Title>{post.title}</Card.Title>
                                            <Card.Text className="text-truncate-3">
                                                {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                                            </Card.Text>
                                            <div className="mt-auto">
                                                <Button
                                                    as={Link}
                                                    to={`/blog/${post.id}`}
                                                    variant={mode === 'dark' ? 'outline-light' : 'outline-primary'}
                                                    className="w-100"
                                                >
                                                    Read More
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {hasMore && (
                            <div className="text-center mt-4">
                                <Button
                                    onClick={loadMore}
                                    disabled={loading}
                                    variant={mode === 'dark' ? 'outline-light' : 'outline-primary'}
                                >
                                    {loading ? 'Loading...' : 'Load More'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Col>
        </Row>
    );
}

export default Blog;

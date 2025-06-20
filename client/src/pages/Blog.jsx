import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button, Card } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext';
import { useSideBar } from '../contexts/SideBarContext';
import { API_BASE_URL } from '../config';
import BlogPostCard from '../components/BlogPostCard';
import '../styles/Blog.css';

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
                const response = await fetch(`${API_BASE_URL}/admin/blog?page=${page}&limit=${postsPerPage}`);

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
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col xs="auto" className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p className="mt-2">Loading blog posts...</p>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} className="text-center">
                        <Card className="border-danger">
                            <Card.Body>
                                <Card.Title className="text-danger">Error Loading Blog Posts</Card.Title>
                                <Card.Text>{error}</Card.Text>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => window.location.reload()}
                                    className="mt-2"
                                >
                                    Retry
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
                <Col 
                    lg={isOpen ? 9 : 12} 
                    className="px-0 px-md-3"
                    style={{
                        transition: 'all 0.3s ease-in-out',
                        marginLeft: isOpen ? '300px' : '0',
                        width: isOpen ? 'calc(100% - 300px)' : '100%',
                        maxWidth: isOpen ? 'calc(100% - 300px)' : '100%',
                        flex: isOpen ? '0 0 calc(100% - 300px)' : '0 0 100%',
                    }}
                >
                    {posts.length === 0 ? (
                        <div className="text-center py-5 my-5">
                            <i className="bi bi-newspaper" style={{ fontSize: '4rem', opacity: 0.2 }}></i>
                            <h3 className="mt-3">No blog posts found</h3>
                            <p className="text-muted mb-4">Check back later for new posts!</p>
                            <Button
                                variant={mode === 'dark' ? 'outline-light' : 'outline-primary'}
                                onClick={() => window.location.reload()}
                            >
                                <i className="bi bi-arrow-clockwise me-2"></i>Refresh
                            </Button>
                        </div>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4 mb-4">
                            {posts.map((post) => (
                                <Col key={post.id}>
                                    <BlogPostCard post={post} mode={mode} />
                                </Col>
                            ))}
                        </Row>
                    )}
                    {hasMore && (
                        <div className="text-center mt-4">
                            <Button
                                onClick={loadMore}
                                disabled={loading}
                                variant={mode === 'dark' ? 'outline-light' : 'outline-primary'}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Loading...
                                    </>
                                ) : (
                                    'Load More'
                                )}
                            </Button>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default Blog;

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
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
        <Row className="position-relative">
            <Col lg={isOpen ? 9 : 12} className="p-0" style={{
                transition: 'all 0.3s ease-in-out',
                marginLeft: 'auto',
                flex: isOpen ? '0 0 75%' : '0 0 100%',
                maxWidth: isOpen ? '75%' : '100%',
                padding: '0 15px'
            }}>
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
                            {loading ? 'Loading...' : 'Load More'}
                        </Button>
                    </div>
                )}
            </Col>
        </Row>
    );
}

export default Blog;

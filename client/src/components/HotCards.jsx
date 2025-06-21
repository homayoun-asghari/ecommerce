import React, { useState, useEffect } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { ArrowRight } from "react-bootstrap-icons";
import { API_BASE_URL } from "../config";

function HotCards() {
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogPosts = async () => {
            try {
                // First, let's check if we can access the API
                console.log('API Base URL:', API_BASE_URL);
                
                // Try a simple public endpoint first to test the connection
                const testUrl = `${API_BASE_URL}/product`;
                console.log('Testing connection to:', testUrl);
                
                // Test connection first
                try {
                    const testResponse = await fetch(testUrl, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    });
                    console.log('Test connection status:', testResponse.status);
                } catch (testErr) {
                    console.error('Test connection failed:', testErr);
                    throw new Error(`Cannot connect to the server. ${testErr.message}`);
                }
                
                // Now try the blog endpoint
                const blogUrl = `${API_BASE_URL}/admin/blog?page=1&limit=2`;
                console.log('Fetching blog posts from:', blogUrl);
                
                const response = await fetch(blogUrl, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any required authentication headers
                        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                console.log('Blog API response status:', response.status);
                
                if (!response.ok) {
                    let errorText;
                    try {
                        errorText = await response.text();
                        console.error('Error response text:', errorText);
                        // Try to parse as JSON if possible
                        const errorData = JSON.parse(errorText);
                        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                    } catch (e) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText || ''}`);
                    }
                }
                
                const data = await response.json();
                console.log('Received blog data:', data);
                
                // The API returns posts in data.posts according to the controller
                const posts = data.posts || [];
                console.log('Processed posts:', posts);
                
                // Log each post's ID and title for debugging
                posts.forEach(post => {
                    console.log(`Post ID: ${post.id}, Title: ${post.title}`);
                });
                
                if (posts.length === 0) {
                    console.warn('No blog posts found. The blog posts array is empty.');
                }
                
                setBlogPosts(posts);
            } catch (err) {
                console.error('Error in fetchBlogPosts:', err);
                setError(`Failed to load blog posts. ${err.message}. Please check your connection and try again.`);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogPosts();
    }, []);

    if (loading) {
        return <div className="text-center py-4">Loading blog posts...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-danger">{error}</div>;
    }

    if (blogPosts.length === 0) {
        return <div className="text-center py-4">No blog posts found</div>;
    }

    return (
        <Row>
            {blogPosts.map((post) => (
                <Col key={post.id} xs={12} md={6} className="py-2">
                    <Card className="h-100">
                        {post.image_url && (
                            <Card.Img 
                                variant="top" 
                                src={post.image_url} 
                                alt={post.title}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                        )}
                        <Card.Body>
                            <Card.Title>{post.title}</Card.Title>
                            <Card.Text className="text-muted">
                                {post.excerpt || post.content?.substring(0, 100) + '...'}
                            </Card.Text>
                            <Link to={`/blog/${post.id || post._id}`} className="btn btn-primary">
                                Read More <ArrowRight />
                            </Link>
                        </Card.Body>
                        <Card.Footer>
                            <small className="text-muted">
                                Posted on {new Date(post.created_at).toLocaleDateString()}
                            </small>
                        </Card.Footer>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

export default HotCards;
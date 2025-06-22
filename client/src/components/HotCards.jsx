import React, { useState, useEffect } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { ArrowRight } from "react-bootstrap-icons";
import { API_BASE_URL } from "../config";
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0.9; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const StyledCard = styled(Card)`
  transition: all 0.3s ease-in-out;
  animation: ${fadeIn} 0.3s ease-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
  
  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .card-text {
    flex-grow: 1;
  }
  
  .card-img-top {
    transition: transform 0.3s ease-in-out;
  }
  
  &:hover .card-img-top {
    transform: scale(1.05);
  }
`;

const ReadMoreButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateX(5px);
    text-decoration: none;
  }
  
  svg {
    transition: transform 0.2s ease-in-out;
  }
  
  &:hover svg {
    transform: translateX(3px);
  }
`;

function HotCards() {
    const { t, i18n } = useTranslation('hotCards');
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
        return <div className="text-center py-4">{t('loading')}</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-danger">{error}</div>;
    }

    if (blogPosts.length === 0) {
        return <div className="text-center py-4">{t('noPosts')}</div>;
    }

    return (
        <Row>
            {blogPosts.map((post) => (
                <Col key={post.id} xs={12} md={6} className="py-2">
                    <StyledCard>
                        {post.image_url && (
                            <Card.Img 
                                variant="top" 
                                src={post.image_url} 
                                alt={post.title}
                                style={{ 
                                    height: '200px', 
                                    objectFit: 'cover',
                                    borderTopLeftRadius: '0.375rem',
                                    borderTopRightRadius: '0.375rem'
                                }}
                                className="card-img-top"
                            />
                        )}
                        <Card.Body>
                            <Card.Title className="mb-3">{post.title}</Card.Title>
                            <Card.Text className="text-muted mb-4">
                                {post.excerpt || post.content?.substring(0, 100) + '...'}
                            </Card.Text>
                            <div className="mt-auto pt-2">
                                <ReadMoreButton 
                                    to={`/blog/${post.id || post._id}`} 
                                    className="btn btn-primary btn-sm px-3 py-2"
                                >
                                    {t('readMore')} <ArrowRight size={16} />
                                </ReadMoreButton>
                            </div>
                        </Card.Body>
                        <Card.Footer className="bg-transparent border-top-0 pt-0">
                            <small className="text-muted">
                                {t('postedOn')} {new Date(post.created_at).toLocaleDateString(i18n.language, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </small>
                        </Card.Footer>
                    </StyledCard>
                </Col>
            ))}
        </Row>
    );
}

export default HotCards;
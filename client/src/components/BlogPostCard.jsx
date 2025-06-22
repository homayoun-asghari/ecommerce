import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';

// Animation keyframes
const fadeIn = keyframes`
  from { 
    opacity: 0.9; 
    transform: scale(0.98); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
`;

const StyledCard = styled(Card)`
  transition: all 0.3s ease-in-out;
  animation: ${fadeIn} 0.4s ease-out;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  }
  
  .card-img-top {
    transition: transform 0.4s ease-in-out;
    height: 200px;
    object-fit: cover;
    width: 100%;
  }
  
  &:hover .card-img-top {
    transform: scale(1.05);
  }
  
  .card-body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 1.5rem;
  }
  
  .card-title {
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--bs-heading-color);
  }
  
  .card-text {
    color: var(--bs-body-color);
    margin-bottom: 1.25rem;
    flex-grow: 1;
  }
`;

const StyledBadge = styled(Badge)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.35em 0.75em;
  border-radius: 50px;
  transition: all 0.2s ease-in-out;
  
  ${StyledCard}:hover & {
    transform: translateY(-2px);
  }
`;

const BlogPostCard = ({ post, mode }) => {
  const { t, i18n } = useTranslation('blogPostCard');
  
  // Format date according to current language
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <StyledCard>
      <div className="position-relative">
        {post.image_url && (
          <Card.Img
            variant="top"
            src={post.image_url}
            alt={post.title}
            className="card-img-top"
          />
        )}
        {post.category && (
          <StyledBadge bg={mode === 'dark' ? 'light' : 'dark'} text={mode === 'dark' ? 'dark' : 'light'}>
            {post.category}
          </StyledBadge>
        )}
      </div>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">
            {formatDate(post.created_at)}
          </small>
          <small className="text-muted">
            {t('minRead', { minutes: Math.ceil(post.content.length / 1000) })}
          </small>
        </div>
        <Card.Title className="h5">{post.title}</Card.Title>
        <Card.Text className="text-truncate-3">
          {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
        </Card.Text>
        <Button
          as={Link}
          to={`/blog/${post.id}`}
          variant={mode === 'dark' ? 'outline-light' : 'outline-primary'}
          className="mt-auto align-self-stretch"
        >
          {t('readMore')}
        </Button>
      </Card.Body>
    </StyledCard>
  );
};

export default BlogPostCard;

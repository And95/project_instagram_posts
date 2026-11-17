import { describe, it, expect } from 'vitest';

import { Post } from '../entities/post.entity.js';

import { InvalidPostImageUrlError } from '../exceptions/invalid-post-image-url.error.js';
import { InvalidPostCaptionError } from '../exceptions/invalid-post-caption.error.js';

describe('Post', () => {
  const validProps = {
    id: 'post-123',
    authorId: 'user-123',
    imageUrl: 'https://example.com/image.jpg',
    caption: 'Minha primeira publicação',
  };

  describe('create', () => {
    it('should create a post with valid properties', () => {
      const post = Post.create(validProps);

      expect(post.id).toBe(validProps.id);
      expect(post.authorId).toBe(validProps.authorId);
      expect(post.imageUrl).toBe(validProps.imageUrl);
      expect(post.caption).toBe(validProps.caption);
      expect(post.createdAt).toBeInstanceOf(Date);
      expect(post.updatedAt).toEqual(post.createdAt);
    });

    it('should reject an empty post ID', () => {
      expect(() => Post.create({ ...validProps, id: ' ' })).toThrow(
        'Post ID cannot be empty.',
      );
    });

    it('should reject an empty author ID', () => {
      expect(() => Post.create({ ...validProps, authorId: ' ' })).toThrow(
        'Post author ID cannot be empty.',
      );
    });

    it('should reject an invalid image URL', () => {
      expect(() =>
        Post.create({ ...validProps, imageUrl: 'invalid-url' }),
      ).toThrow(InvalidPostImageUrlError);
    });

    it('should reject a non-HTTP image URL', () => {
      expect(() =>
        Post.create({ ...validProps, imageUrl: 'ftp://example.com/image.jpg' }),
      ).toThrow(InvalidPostImageUrlError);
    });

    it('should reject captions longer than 2200 characters', () => {
      expect(() =>
        Post.create({ ...validProps, caption: 'a'.repeat(2201) }),
      ).toThrow(InvalidPostCaptionError);
    });

    it('should allow a post without a caption', () => {
      const post = Post.create({
        ...validProps,
        caption: null,
      });

      expect(post.caption).toBeNull();
    });
  });

  describe('updateContent', () => {
    it('should update the image URL and caption', () => {
      const post = Post.create(validProps);

      post.updateContent({
        imageUrl: 'https://example.com/new-image.jpg',
        caption: 'Legenda atualizada',
      });

      expect(post.imageUrl).toBe('https://example.com/new-image.jpg');
      expect(post.caption).toBe('Legenda atualizada');
    });

    it('should allow removing the caption', () => {
      const post = Post.create(validProps);

      post.updateContent({ caption: null });

      expect(post.caption).toBeNull();
    });

    it('should preserve the author ID when updating content', () => {
      const post = Post.create(validProps);

      post.updateContent({ caption: 'Nova legenda' });

      expect(post.authorId).toBe(validProps.authorId);
    });

    it('should reject an invalid image URL during update', () => {
      const post = Post.create(validProps);

      expect(() => post.updateContent({ imageUrl: 'invalid-url' })).toThrow(
        InvalidPostImageUrlError,
      );
    });
  });

  describe('reconstitute', () => {
    it('should restore a previously persisted post', () => {
      const createdAt = new Date('2026-11-17T10:00:00.000Z');
      const updatedAt = new Date('2026-11-17T11:00:00.000Z');

      const post = Post.reconstitute({
        ...validProps,
        createdAt,
        updatedAt,
      });

      expect(post.id).toBe(validProps.id);
      expect(post.authorId).toBe(validProps.authorId);
      expect(post.imageUrl).toBe(validProps.imageUrl);
      expect(post.caption).toBe(validProps.caption);
      expect(post.createdAt).toEqual(createdAt);
      expect(post.updatedAt).toEqual(updatedAt);
    });
  });
});

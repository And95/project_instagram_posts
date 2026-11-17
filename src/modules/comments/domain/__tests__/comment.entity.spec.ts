import { describe, expect, it } from 'vitest';

import { Comment } from '../entities/comment.entity.js';
import { InvalidCommentContentError } from '../exceptions/invalid-comment-content.error.js';
import { InvalidCommentParentError } from '../exceptions/invalid-comment-parent.error.js';
import { InvalidCommentReferenceError } from '../exceptions/invalid-comment-reference.error.js';

describe('Comment', () => {
  const validProps = {
    id: 'comment-1',
    postId: 'post-1',
    authorId: 'user-1',
    content: 'This is a comment.',
  };

  describe('create', () => {
    it('should create a root comment', () => {
      const comment = Comment.create(validProps);

      expect(comment.id).toBe(validProps.id);
      expect(comment.postId).toBe(validProps.postId);
      expect(comment.authorId).toBe(validProps.authorId);
      expect(comment.parentCommentId).toBeNull();
      expect(comment.content).toBe(validProps.content);
    });

    it('should create a nested reply', () => {
      const comment = Comment.create({
        ...validProps,
        parentCommentId: 'comment-parent',
      });

      expect(comment.parentCommentId).toBe('comment-parent');
    });

    it('should normalize content by trimming spaces', () => {
      const comment = Comment.create({
        ...validProps,
        content: '  Hello world!  ',
      });

      expect(comment.content).toBe('Hello world!');
    });

    it('should reject empty content', () => {
      expect(() => Comment.create({ ...validProps, content: '   ' })).toThrow(
        InvalidCommentContentError,
      );
    });

    it('should reject content longer than 2200 characters', () => {
      expect(() =>
        Comment.create({
          ...validProps,
          content: 'a'.repeat(2201),
        }),
      ).toThrow(InvalidCommentContentError);
    });

    it('should reject itself as parent', () => {
      expect(() =>
        Comment.create({
          ...validProps,
          parentCommentId: validProps.id,
        }),
      ).toThrow(InvalidCommentParentError);
    });

    it('should reject an empty comment ID', () => {
      expect(() => Comment.create({ ...validProps, id: ' ' })).toThrow(
        InvalidCommentReferenceError,
      );
    });

    it('should reject an empty post ID', () => {
      expect(() => Comment.create({ ...validProps, postId: '' })).toThrow(
        InvalidCommentReferenceError,
      );
    });

    it('should reject an empty author ID', () => {
      expect(() => Comment.create({ ...validProps, authorId: '' })).toThrow(
        InvalidCommentReferenceError,
      );
    });
  });

  describe('reconstitute', () => {
    it('should restore a persisted comment', () => {
      const createdAt = new Date('2026-01-01T10:00:00.000Z');
      const updatedAt = new Date('2026-01-02T10:00:00.000Z');

      const comment = Comment.reconstitute({
        ...validProps,
        parentCommentId: null,
        createdAt,
        updatedAt,
      });

      expect(comment.id).toBe(validProps.id);
      expect(comment.postId).toBe(validProps.postId);
      expect(comment.authorId).toBe(validProps.authorId);
      expect(comment.content).toBe(validProps.content);
      expect(comment.createdAt).toBe(createdAt);
      expect(comment.updatedAt).toBe(updatedAt);
    });
  });

  describe('updateContent', () => {
    it('should update comment content', () => {
      const comment = Comment.create(validProps);

      comment.updateContent({ content: 'Updated content.' });

      expect(comment.content).toBe('Updated content.');
    });

    it('should preserve identifiers when updating content', () => {
      const comment = Comment.create(validProps);

      comment.updateContent({ content: 'Updated content.' });

      expect(comment.id).toBe(validProps.id);
      expect(comment.postId).toBe(validProps.postId);
      expect(comment.authorId).toBe(validProps.authorId);
      expect(comment.parentCommentId).toBeNull();
    });
  });
});

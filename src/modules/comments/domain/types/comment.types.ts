export interface CreateCommentProps {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId?: string | null;
  content: string;
}

export interface UpdateCommentProps {
  content: string;
}

export interface ReconstituteCommentProps {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

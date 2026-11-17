export interface CreatePostProps {
  id: string;
  authorId: string;
  imageUrl: string;
  caption?: string | null;
}

export interface UpdatePostProps {
  imageUrl?: string;
  caption?: string | null;
}

export interface ReconstitutePostProps {
  id: string;
  authorId: string;
  imageUrl: string;
  caption: string | null;
  createdAt: Date;
  updatedAt: Date;
}

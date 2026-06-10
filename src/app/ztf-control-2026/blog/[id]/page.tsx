'use client';
import { use } from 'react';
import BlogEditor from '../BlogEditor';

export default function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BlogEditor mode="edit" postId={id} />;
}

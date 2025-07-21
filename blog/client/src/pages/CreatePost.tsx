import React from 'react';
import { useBlog } from '../context/BlogContext';
import { useNavigate } from 'react-router-dom';

const CreatePost: React.FC = () => {
  const navigate = useNavigate()
  const { 
    newPost, 
    setNewPost, 
    categories, 
    handleCreatePost, 
    // navigate,
    isEditing
  } = useBlog();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-slide-up">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {isEditing ? 'Postu Düzenle' : 'Yeni Post Oluştur'}
      </h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
          <input
            id="post-title"
            type="text"
            placeholder="Post başlığınızı yazın..."
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="post-category" className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select
              id="post-category"
              value={newPost.category}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              className="input"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="post-tags" className="block text-sm font-medium text-gray-700 mb-2">Etiketler</label>
            <input
              id="post-tags"
              type="text"
              placeholder="react, javascript, web (virgülle ayırın)"
              value={newPost.tags}
              onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-2">İçerik</label>
          <textarea
            id="post-content"
            placeholder="Hikayenizi anlatın..."
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            rows={8}
            className="input resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newPost.isDraft}
              onChange={(e) => setNewPost({ ...newPost, isDraft: e.target.checked })}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Taslak olarak kaydet</span>
          </label>

          <div className="flex space-x-3">
            <button
              onClick={() => navigate('home')}
              className="btn btn-secondary"
            >
              İptal
            </button>
            <button
              onClick={handleCreatePost}
              className="btn btn-primary"
              disabled={!newPost.title.trim() || !newPost.content.trim()}
            >
              {isEditing ? 'Güncelle' : (newPost.isDraft ? 'Taslağı Kaydet' : 'Yayınla')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
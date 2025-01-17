import * as api from '$lib/api';
import { page_size } from '$lib/constants';

export async function get({ url: { searchParams }, locals }) {
  const tab = searchParams.get('tab') || 'all';
  const tag = searchParams.get('tag');
  const page = +searchParams.get('page') || 1;

  const endpoint = tab === 'feed' ? 'articles/feed' : 'articles';

  const q = new URLSearchParams();

  q.set('limit', page_size);
  q.set('offset', (page - 1) * page_size);

  if (tag) {
    q.set('tag', tag);
  }

  const { articles, articlesCount } = await api.get(
    `${endpoint}?${q}`,
    locals.user && locals.user.token
  );

  return {
    body: {
      articles,
      pages: Math.ceil(articlesCount / page_size),
    },
  };
}

export async function post({ request, locals }) {
  const form = await request.formData();

  const tagList = form.getAll('tagList[]');
  console.log('tagList', tagList);

  const data = {
    article: {
      title: form.get('title'),
      description: form.get('description'),
      body: form.get('body'),
      tagList,
    },
  };

  const response = await api.post(
    'articles',
    data,
    locals.user && locals.user.token
  );

  // console.log('response', response);

  if (!response.article) {
    return {
      status: 400,
      body: {
        errors: response,
      },
    };
  }

  const article = response.article;

  return {
    status: 201,
    body: {
      article,
    },
  };
}

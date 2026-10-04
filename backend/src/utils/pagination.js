export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  return { page, limit, skip, sort: { [sortBy]: sortOrder } };
};

export const getPagingData = (data, page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    items: data,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

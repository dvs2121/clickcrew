function getPhotographerFilters(form) {
  const data = new FormData(form);
  return {
    search: data.get("search"),
    location: data.get("location"),
    category: data.get("category"),
    type: data.get("type"),
    date: data.get("date"),
    time: data.get("time"),
    maxPrice: data.get("price"),
    maxPhotoPrice: data.get("photoPrice"),
    rating: data.get("rating"),
    equipment: data.get("equipment"),
    availability: data.get("availability") === "on" ? "true" : "",
  };
}

function sortPhotographers(list, sortBy) {
  const sorted = [...list];
  if (sortBy === "price-low") sorted.sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") sorted.sort((a, b) => b.price - a.price);
  if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);
  if (sortBy === "reviews") sorted.sort((a, b) => b.reviews - a.reviews);
  return sorted;
}

import api from "./api";
import type { Product, ProductsResponse, ProductQueryParams } from "../types";

export const getProducts = async (
  params: ProductQueryParams,
): Promise<ProductsResponse> => {
  const { data } = await api.get<ProductsResponse>("/products", { params });
  return data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
};

// FormData is used because this endpoint accepts image file uploads
export const createProduct = async (formData: FormData): Promise<Product> => {
  const { data } = await api.post<Product>("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateProduct = async (
  id: string,
  formData: FormData,
): Promise<Product> => {
  const { data } = await api.put<Product>(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteProduct = async (
  id: string,
): Promise<{ message: string }> => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
export const getCategories = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>("/products/categories");
  return data;
};

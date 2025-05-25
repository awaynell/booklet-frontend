import { openLibraryApiClient } from "@/config/apiClient";
import { IBook } from "@/types/books";
import { useInfiniteQuery } from "@tanstack/react-query";

interface BooksPage {
  books: IBook[];
  nextPage: number;
}

export const useBooks = () => {
  return useInfiniteQuery<BooksPage>({
    queryKey: ["books"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await openLibraryApiClient.get<{ docs: IBook[] }>(
        `/search.json`,
        {
          params: {
            page: pageParam,
            limit: 25,
            sort: "random",
            land: "rus",
            q: "q",
          },
        }
      );

      return {
        books: response.data.docs
          .filter((book) => book.cover_i)
          .map((book) => ({
            ...book,
            likes: 0,
            isLiked: false,
          })),
        nextPage: Number(pageParam) + 1,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60,
  });
};

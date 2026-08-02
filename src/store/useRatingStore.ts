import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Rating } from "../domain/types";

interface RatingState {
  ratings: Record<number, Rating>; // tripId -> Rating
  addRating: (rating: Rating) => void;
}

export const useRatingStore = create<RatingState>()(
  persist(
    (set) => ({
      ratings: {},
      addRating: (rating) =>
        set((state) => ({
          ratings: { ...state.ratings, [rating.tripId]: rating },
        })),
    }),
    {
      name: "raphael-ratings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

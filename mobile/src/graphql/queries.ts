import { gql } from '@apollo/client';

// GraphQL query to fetch all restaurants
export const GET_ALL_RESTAURANTS = gql`
  query GetAllRestaurants {
    getAllRestaurants {
      id
      name
      description
      imageUrl
    }
  }
`;

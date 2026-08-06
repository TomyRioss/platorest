import { FEATURED_CATEGORY_DEFAULT_NAME } from "./featured-category";

export type DefaultModifierGroup = {
  name: string;
  required: boolean;
  multiple: boolean;
  options: { name: string; price?: number }[];
};

export type DefaultProduct = {
  categoryName: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  modifierGroups?: DefaultModifierGroup[];
};

function pexels(id: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
}

export const DEFAULT_PRODUCTS: DefaultProduct[] = [
  {
    categoryName: FEATURED_CATEGORY_DEFAULT_NAME,
    name: "Hamburguesa clásica con papas",
    description: "Medallón casero, cheddar, lechuga y tomate.",
    price: 8500,
    imageUrl: pexels(3616956),
    modifierGroups: [
      {
        name: "Agregos",
        required: false,
        multiple: true,
        options: [
          { name: "Panceta", price: 800 },
          { name: "Huevo frito", price: 500 },
          { name: "Cheddar extra", price: 600 },
        ],
      },
    ],
  },
  {
    categoryName: "Destacados",
    name: "Milanesa napolitana con papas",
    description: "Con salsa de tomate, jamón y queso gratinado.",
    price: 10500,
    imageUrl: pexels(20670978),
  },
  {
    categoryName: "Platos",
    name: "Ensalada César con pollo",
    description: "Lechuga romana, pollo grillado, crutones y aderezo César.",
    price: 8000,
    imageUrl: pexels(19938473),
  },
  {
    categoryName: "Postres",
    name: "Flan casero",
    description: "Con dulce de leche y crema.",
    price: 4500,
    imageUrl: pexels(25916369),
  },
  {
    categoryName: "Bebidas",
    name: "Gaseosa 500ml",
    description: "Fría. Elegí el sabor.",
    price: 3000,
    imageUrl: pexels(8880742),
    modifierGroups: [
      {
        name: "Sabor",
        required: true,
        multiple: false,
        options: [
          { name: "Coca-Cola" },
          { name: "Sprite" },
          { name: "Fanta" },
        ],
      },
    ],
  },
];

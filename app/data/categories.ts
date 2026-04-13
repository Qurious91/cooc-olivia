import {
  ChefHat, UtensilsCrossed, Coffee, Wine, Cake,
  Pizza, Salad, Soup, Beef, IceCream,
  Fish, Apple, Carrot, Wheat, Egg, Croissant,
  UserPlus, FlaskConical, Store, Handshake,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  Icon: LucideIcon;
  label: string;
};

export const HOME_CATEGORIES: Category[] = [
  { Icon: UserPlus, label: "게스트 초청" },
  { Icon: FlaskConical, label: "메뉴 테스트" },
  { Icon: ChefHat, label: "메뉴 개발" },
  { Icon: Store, label: "팝업 행사" },
  { Icon: Handshake, label: "컨설팅" },
];

export const CREATOR_CATEGORIES: Category[] = [
  { Icon: ChefHat, label: "F&B크리에이터" },
  { Icon: UtensilsCrossed, label: "다이닝" },
  { Icon: Soup, label: "수프" },
  { Icon: Pizza, label: "피자" },
  { Icon: Salad, label: "샐러드" },
  { Icon: Coffee, label: "커피" },
  { Icon: Wine, label: "와인" },
  { Icon: IceCream, label: "디저트" },
  { Icon: Cake, label: "베이커리" },
  { Icon: Beef, label: "정육" },
  { Icon: Fish, label: "수산" },
  { Icon: Apple, label: "과일" },
  { Icon: Carrot, label: "채소" },
  { Icon: Wheat, label: "곡물" },
  { Icon: Egg, label: "난류" },
  { Icon: Croissant, label: "브런치" },
];

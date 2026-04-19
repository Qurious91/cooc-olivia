import {
  ChefHat, UtensilsCrossed, Coffee, Wine, Cake,
  Pizza, Salad, Soup, Beef, IceCream,
  Fish, Apple, Carrot, Wheat, Egg, Croissant,
  UserPlus, FlaskConical, Store, Handshake,
  Factory, Building2, ShoppingBag, GlassWater,
  Package, Microwave, Leaf, Sprout, Bike, Utensils,
  Rocket, Globe, Truck, Megaphone,
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

export const BRAND_CATEGORIES: Category[] = [
  { Icon: Factory, label: "식품제조" },
  { Icon: Store, label: "유통" },
  { Icon: Building2, label: "프랜차이즈" },
  { Icon: ShoppingBag, label: "편의점" },
  { Icon: Wine, label: "주류" },
  { Icon: GlassWater, label: "음료" },
  { Icon: Coffee, label: "커피" },
  { Icon: Cake, label: "디저트" },
  { Icon: Croissant, label: "베이커리" },
  { Icon: Package, label: "밀키트" },
  { Icon: Microwave, label: "HMR" },
  { Icon: Leaf, label: "건강식품" },
  { Icon: Sprout, label: "친환경" },
  { Icon: Bike, label: "배달" },
  { Icon: Truck, label: "물류" },
  { Icon: Utensils, label: "주방용품" },
  { Icon: Megaphone, label: "마케팅" },
  { Icon: Rocket, label: "스타트업" },
  { Icon: Globe, label: "글로벌" },
  { Icon: Handshake, label: "파트너십" },
];

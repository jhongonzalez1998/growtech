export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image:string;
  images: string[];
  category: string;
  whatsappCode: string;
}

export interface CartItem extends Product {
  quantity: number;
}

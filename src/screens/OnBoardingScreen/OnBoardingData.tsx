import {
  ColorfulQR_Icon,
  FirstOn_Icon,
  SecondOn_Icon,
  ThirdOn_Icon,
} from '../../assets/icons';

interface OnBoardingItem {
  id: number;
  Icon: React.ComponentType<{height: number; width: number}>;
  Heading: string;
  SubHeading: string;
}

export const OnBoardingData: OnBoardingItem[] = [
  {
    id: 1,
    Icon: ColorfulQR_Icon,
    Heading: ' Stay Connected, Anytime, Anywhere',
    SubHeading: 'Enjoy seamless and secure messaging',
  },
  {
    id: 2,
    Icon: SecondOn_Icon,
    Heading: 'Your Conversations, Your Way',
    SubHeading: 'Organize chats with an intuitive interface',
  },
  {
    id: 3,

    Icon: FirstOn_Icon,
    Heading: 'Secure & Private Messaging',
    SubHeading: 'Control your online presence and privacy settings',
  },
  {
    id: 4,
    Icon: ThirdOn_Icon,
    Heading: 'More Than Just Messages',
    SubHeading: 'Express yourself with emojis and stickers',
  },
];

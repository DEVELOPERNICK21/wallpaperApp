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
    Heading: 'Access your pay slips anytime',
    SubHeading:
      'Download and review your monthly salary details with just a click.',
  },
  {
    id: 2,
    Icon: SecondOn_Icon,
    Heading: 'Apply for leaves on the go',
    SubHeading:
      'Submit leave requests, view balances, and track approvals instantly.',
  },
  {
    id: 3,

    Icon: FirstOn_Icon,
    Heading: 'Mark your attendance with a tap',
    SubHeading:
      'View, manage, and track your work hours and attendance with ease.',
  },
  {
    id: 4,
    Icon: ThirdOn_Icon,
    Heading: 'You’re All Set!',
    SubHeading:
      'Log in to take charge of your HR procedures and learn more about edsom fintech Pvt.ltd.',
  },
];

import { Meta, StoryObj } from "@storybook/react";
import { NewBox } from "./Box";

const meta = {
  title: 'Example/basic/Box',
  component: NewBox,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Hello, World!',
  },
  tags: ['autodocs'],
} as Meta<typeof NewBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    backgroundColor: 'lightblue',
  },
};

export const RedBox: Story = {
  args: {
    backgroundColor: 'red',
  },
};


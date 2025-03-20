import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { LoginPage, LoginPageProps } from './LoginPage';
import { fn } from '@storybook/test';

const meta = {
  title: 'Example/pages/LoginPage',
  component: LoginPage,
} as Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onLogin: fn(),
  }
};
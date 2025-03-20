import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Modal, ModalProps } from './Modal';
// import { ModalUsagePage, ModalUsagePageProps } from './Modal.usage';
import { fn } from '@storybook/test';
import { Button, NewBox } from '../basic';

const meta = {
  title: 'Example/interaction/Modal',
  component: Modal,
  args: {
    children: '모달 내용',
    onClose: fn(),
  },
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} as Meta;

export default meta;
type Story = StoryObj<ModalProps>;

export const Default: Story = {
  args: {
    
  },
  render: (args) => {
    const [showModal, setShowModal] = React.useState(false);

    return (
    <NewBox
    style={{
      width: '100%',
      height: 'calc(30vh)',
    }}
    >
      <Button label="Open Modal" onClick={() => setShowModal(true)} />
      <Modal isOpen={showModal} setIsOpen={setShowModal} onClose={args.onClose}>
        {args.children}
      </Modal>
    </NewBox>
    )
  }
};

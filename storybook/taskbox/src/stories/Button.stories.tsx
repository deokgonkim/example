import { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";


const meta = {
    tags: ["autodocs"],
    component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// export const Primary: Story = () => <Button primary>Primary</Button>;

export const Primary: Story = {
    args: {
        primary: true,
        children: "Primaary",
    },
}

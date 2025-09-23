'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const FirstPage = () => {

    const onClick = () => {
        alert('Button clicked!');
    }

    return (
        <div>
            <h1>Hello</h1>
            <Button onClick={onClick}>Click here</Button>
            <Card>This is card</Card>
        </div>
    )
}

export default FirstPage;

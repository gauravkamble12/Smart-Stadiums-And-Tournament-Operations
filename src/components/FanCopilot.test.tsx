import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FanCopilot } from './FanCopilot';

describe('FanCopilot Component', () => {
    it('renders the initial AI greeting', () => {
        render(<FanCopilot isSosActive={false} />);
        expect(screen.getByText(/Hello! I'm your ArenaMind Copilot/i)).toBeInTheDocument();
    });

    it('handles user input and displays user message', () => {
        render(<FanCopilot isSosActive={false} />);
        const input = screen.getByPlaceholderText(/Ask anything/i);
        const sendBtn = screen.getByRole('button', { name: /send message/i });

        fireEvent.change(input, { target: { value: 'Where is the nearest exit?' } });
        fireEvent.click(sendBtn);

        expect(screen.getByText('Where is the nearest exit?')).toBeInTheDocument();
    });
});

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TournamentConsole } from './TournamentConsole';
import { TelemetryProvider } from '../context/TelemetryContext';

describe('TournamentConsole Component', () => {
    it('renders the tournament operations header and fixtures list', () => {
        render(
            <TelemetryProvider>
                <TournamentConsole />
            </TelemetryProvider>
        );
        expect(screen.getByText('Tournament Operations Center')).toBeInTheDocument();
        expect(screen.getByText('Match Operations Roster')).toBeInTheDocument();
        expect(screen.getAllByText('Argentina').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Brazil').length).toBeGreaterThan(0);
    });

    it('allows assigning a referee to an unassigned match', async () => {
        render(
            <TelemetryProvider>
                <TournamentConsole />
            </TelemetryProvider>
        );
        
        // Find unassigned refs
        const assignButtons = screen.getAllByText('Assign Ref');
        expect(assignButtons.length).toBeGreaterThan(0);
        
        await act(async () => {
            fireEvent.click(assignButtons[0]);
        });
        
        // Unassigned text should disappear for that specific item
        expect(screen.queryByText('Ref: Unassigned')).toBeNull();
    });

    it('allows scheduling a new fixture', async () => {
        render(
            <TelemetryProvider>
                <TournamentConsole />
            </TelemetryProvider>
        );
        
        const initialCount = screen.getAllByText(/vs/i).length;
        
        const submitButton = screen.getByText('Add to Roster');
        await act(async () => {
            fireEvent.click(submitButton);
        });
        
        const finalCount = screen.getAllByText(/vs/i).length;
        expect(finalCount).toBe(initialCount + 1);
    });
});

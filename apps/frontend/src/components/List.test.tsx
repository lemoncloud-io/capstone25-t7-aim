import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import List from './List';

// test exmaple
const fewBooks = [
    { id: 'asdas', title: '2001: A Space Odyssey' },
    { id: 'asdasd', title: 'Rendezvous with Rama' },
];

describe('List tests', () => {
    it('Should render the list', () => {
        render(<List books={fewBooks} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(fewBooks.length);
        expect(screen.getByText(fewBooks[0].title)).toBeInTheDocument();
    });
});

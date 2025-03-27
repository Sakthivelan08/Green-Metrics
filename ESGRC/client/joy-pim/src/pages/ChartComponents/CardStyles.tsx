import { mergeStyleSets } from '@fluentui/react';

export const cardStyles = mergeStyleSets({
    card: {
        background: 'var(--surface - card)',
        padding: '2rem',
        borderRadius: ' 10px',
        marginBottom: ' 1rem',
        width: '90%',
        height: '90vh',
        overflow: 'scroll',
        position: 'fixed'
    },
    imgStyle: {
        height: '20px',
        width: '20px'
    },
    cardSelection: {
        backgroundColor: '#6366f1 !important',
        color: 'white !important'
    }

});
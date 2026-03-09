import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnswerKeySection } from '@/components/answer-key-section'
import type { AnswerKeyResponse } from '@/lib/types'

// Stub next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

// Stub sonner
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

// Stub API calls
vi.mock('@/lib/api', () => ({
    uploadAnswerKeyPdf: vi.fn(),
    saveAnswerKey: vi.fn(),
    ApiError: class ApiError extends Error {
        status: number
        constructor(status: number, message: string) {
            super(message)
            this.status = status
        }
    },
}))

const EXAM_ID = 'test-exam-123'

const createAnswerKey = (
    answers: Record<string, string>,
): AnswerKeyResponse => ({
    answer_key_id: 'ak-1',
    answers,
})

describe('AnswerKeySection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ----- Rendering without answer key -----

    it('shows upload tab by default when no answer key exists', () => {
        render(
            <AnswerKeySection examId={EXAM_ID} initialAnswerKey={null} />,
        )

        // The upload drop zone text should be visible
        expect(
            screen.getByText('Clique para selecionar o PDF do gabarito'),
        ).toBeInTheDocument()
    })

    it('shows empty message on edit tab when no answer key exists', async () => {
        const user = userEvent.setup()

        render(
            <AnswerKeySection examId={EXAM_ID} initialAnswerKey={null} />,
        )

        // Switch to "Editar gabarito" tab
        await user.click(screen.getByText('Editar gabarito'))

        expect(
            screen.getByText(/Nenhum gabarito cadastrado/),
        ).toBeInTheDocument()
    })

    // ----- Rendering with answer key -----

    it('shows edit tab by default when answer key exists', () => {
        const answerKey = createAnswerKey({ '1': 'A', '2': 'B', '3': 'C' })

        render(
            <AnswerKeySection examId={EXAM_ID} initialAnswerKey={answerKey} />,
        )

        // Should show labelled inputs Q1, Q2, Q3
        expect(screen.getByText('Q1')).toBeInTheDocument()
        expect(screen.getByText('Q2')).toBeInTheDocument()
        expect(screen.getByText('Q3')).toBeInTheDocument()
    })

    // ----- Controlled value regression -----

    it('all answer inputs always have a defined value (no uncontrolled→controlled)', () => {
        // Simulate answers where some values might be empty strings
        const answerKey = createAnswerKey({
            '1': 'A',
            '2': '',
            '3': 'C',
            '4': 'D',
        })

        render(
            <AnswerKeySection examId={EXAM_ID} initialAnswerKey={answerKey} />,
        )

        const inputs = screen.getAllByRole('textbox')
        inputs.forEach((input) => {
            // value should NEVER be undefined — it must be a string
            expect((input as HTMLInputElement).value).toBeDefined()
            expect(typeof (input as HTMLInputElement).value).toBe('string')
        })
    })

    it('renders correct values in answer inputs', () => {
        const answerKey = createAnswerKey({ '1': 'A', '2': 'B' })

        render(
            <AnswerKeySection examId={EXAM_ID} initialAnswerKey={answerKey} />,
        )

        const inputs = screen.getAllByRole('textbox')
        // Sorted entries: Q1=A, Q2=B
        expect((inputs[0] as HTMLInputElement).value).toBe('A')
        expect((inputs[1] as HTMLInputElement).value).toBe('B')
    })

    // ----- Tab switching -----

    it('can switch between upload and edit tabs', async () => {
        const user = userEvent.setup()
        const answerKey = createAnswerKey({ '1': 'A' })

        render(
            <AnswerKeySection examId={EXAM_ID} initialAnswerKey={answerKey} />,
        )

        // Should start on edit tab (has answer key)
        expect(screen.getByText('Q1')).toBeInTheDocument()

        // Switch to upload tab
        await user.click(screen.getByText('Importar via PDF'))

        expect(
            screen.getByText('Clique para selecionar o PDF do gabarito'),
        ).toBeInTheDocument()

        // Switch back to edit tab
        await user.click(screen.getByText('Editar gabarito'))

        expect(screen.getByText('Q1')).toBeInTheDocument()
    })

    // ----- Editing answers -----

    it('updates answer value on input change', async () => {
        const user = userEvent.setup()
        const answerKey = createAnswerKey({ '1': 'A' })

        render(
            <AnswerKeySection examId={EXAM_ID} initialAnswerKey={answerKey} />,
        )

        const input = screen.getAllByRole('textbox')[0] as HTMLInputElement
        expect(input.value).toBe('A')

        // Clear and type new value
        await user.clear(input)
        await user.type(input, 'c')

        // Should uppercase automatically
        expect(input.value).toBe('C')
    })
})

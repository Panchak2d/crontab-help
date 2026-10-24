import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleBuilder } from '../../src/components/ScheduleBuilder';

describe('ScheduleBuilder', () => {
  it('emits the expression for the current format when a weekday is toggled', () => {
    const onChange = vi.fn();
    render(<ScheduleBuilder expression="0 0 9 ? * MON-FRI" format="quartz" onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Fri' }));
    expect(onChange).toHaveBeenCalledWith('0 0 9 ? * MON-THU');
  });

  it('shows a note and no controls for an expression it cannot represent', () => {
    const onChange = vi.fn();
    render(<ScheduleBuilder expression="0 0 0 L * ?" format="quartz" onChange={onChange} />);
    expect(screen.getByRole('status')).toHaveTextContent(/too complex/i);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('writes the first change into an empty input', () => {
    const onChange = vi.fn();
    render(<ScheduleBuilder expression="" format="unix" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Minute'), { target: { value: 'step' } });
    expect(onChange).toHaveBeenCalledWith('*/5 * * * *');
  });
});

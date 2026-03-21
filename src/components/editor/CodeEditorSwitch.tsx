'use client';

import { DragDropEditor } from './DragDropEditor';
import { FillBlankEditor } from './FillBlankEditor';
import { FreeCodeEditor } from './FreeCodeEditor';
import type { EditorProps } from './types';

export function CodeEditorSwitch(props: EditorProps) {
  switch (props.challenge.type) {
    case 'drag':
      return <DragDropEditor {...props} />;
    case 'fill_blank':
    case 'multiple_choice':
      return <FillBlankEditor {...props} />;
    case 'free_code':
      return <FreeCodeEditor {...props} />;
    default:
      return <FreeCodeEditor {...props} />;
  }
}

'use client';

import React, { useCallback, useEffect, useState } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useBroadcastEvent, useEventListener, useMyPresence } from '@/liveblocks.config'
import { CursorMode, CursorState, Reaction, ReactionEvent } from '@/types/type';
import CursorChat from './cursor/CursorChat';
import ReactionSelector from './reaction/ReactionSelector';
import FlyingReaction from './reaction/FlyingReaction';
import useInterval from '@/hooks/useInterval';
import { Comments } from './comments/Comments';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ui/context-menu';
import { shortcuts } from '@/constants';

type Props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  canvasBackgroundColor: string;
  undo: () => void;
  redo: () => void;
}

const Live = ({ canvasRef, canvasBackgroundColor, undo, redo } : Props) => {

  const [{ cursor }, updateMyPresence] = useMyPresence();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden
  })
  const [reaction, setReaction] = useState<Reaction[]>([]);

  const broadcast = useBroadcastEvent();

  useInterval(() => {
    setReaction((reactions) => reactions.filter((r) => r.timestamp > Date.now() - 4000));
  }, 1000);

  useInterval(() => {
    if (cursor && cursorState.mode===CursorMode.Reaction && cursorState.isPressed) {
      setReaction((r) => r.concat([{
        value: cursorState.reaction,
        timestamp: Date.now(),
        point: { x: cursor.x, y: cursor.y }
      }]));
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction
      })
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event;
    setReaction((r) => r.concat([{
      value: event.value,
      timestamp: Date.now(),
      point: { x: event.x, y: event.y }
    }]));
  })

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    
    if (cursor===null || cursorState.mode!==CursorMode.ReactionSelector) {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
      updateMyPresence({ cursor: {x, y} });
    }
  }, []);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {

    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientX - event.currentTarget.getBoundingClientRect().y;
    updateMyPresence({ cursor: {x, y} });

    setCursorState((state: CursorState) => cursorState.mode===CursorMode.Reaction? 
    { ...state, isPressed: true } : state);
  }, [cursorState.mode, setCursorState]);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {

    setCursorState((state: CursorState) => cursorState.mode===CursorMode.Reaction? 
    { ...state, isPressed: true } : state);
  }, [cursorState.mode, setCursorState]);

  const handleReactions = useCallback((r: string) => {
    setCursorState({ 
      mode: CursorMode.Reaction, reaction: r, isPressed: false 
    });
  }, []);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key==='/') {
        setCursorState({
          mode: CursorMode.Chat,
          message: '',
          previousMessage: null
        });
      } else if (e.key==='Escape') {
        updateMyPresence({ message: '' });
        setCursorState({
          mode: CursorMode.Hidden
        });
      } else if (e.key==='e') {
        setCursorState({
          mode: CursorMode.ReactionSelector
        })
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key==='/') {
        e.preventDefault();
      }
    }

    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);
    
    return () => {
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('keydown', onKeyDown);
    }

  }, [updateMyPresence]);

  
  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case 'Chat':
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: ''
        })
        break;
      case 'Undo':
        undo();
        break;
      case 'Redo':
        redo();
        break;
      case 'Reactions':
        setCursorState({
          mode: CursorMode.ReactionSelector
        })
        break;
      default:
        break;
    }
  }, []);


  return (
    <ContextMenu>
      <ContextMenuTrigger
        id='canvas'
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className='h-full w-full relative flex flex-col justify-center items-center'
        style={{ backgroundColor: canvasBackgroundColor || '#202731' }}
      >

        <canvas ref={canvasRef} />

        {reaction.map((r) => (
          <FlyingReaction
            key={r.timestamp.toString()}
            x={r.point.x}
            y={r.point.y}
            timestamp={r.timestamp}
            value={r.value}
          />
        ))}

        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}

        {cursorState.mode===CursorMode.ReactionSelector && (
          <ReactionSelector
            setReaction={handleReactions}
          />
        )}

        <LiveCursors />

        <Comments />
      </ContextMenuTrigger>

      <ContextMenuContent className='right-menu-content'>
        {shortcuts.map(item => (
          <ContextMenuItem key={item.key} className='right-menu-item' onClick={() => handleContextMenuClick(item.name)}>
            <p>{item.name}</p>
            <p className='text-xs text-primary-grey-300'>
              {item.shortcut}
            </p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default Live
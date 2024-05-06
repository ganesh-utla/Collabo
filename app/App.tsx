'use client'

import { fabric } from "fabric";
import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { useEffect, useRef, useState } from "react";
import { handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp, handleCanvasObjectModified, handleCanvasObjectScaling, handleCanvasSelectionCreated, handlePathCreated, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { ActiveElement, Attributes, CanvasAttributes } from "@/types/type";
import { useMutation, useRedo, useStorage, useUndo } from "@/liveblocks.config";
import { defaultNavElement } from "@/constants";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";

export default function Page() {

  const undo = useUndo();
  const redo = useRedo();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    icon: "/assets/select.svg",
    name: "Select",
    value: "select",
  });
  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: '',
    height: '',
    fontSize: '',
    fontWeight: '',
    fontFamily: '',
    fill: '',
    stroke: '',
    strokeWidth: 0,
    opacity: 1
  })

  const [canvasAttributes, setCanvasAttributes] = useState<CanvasAttributes>({
    backgroundColor: '#202731'
  })

  const canvasObjects = useStorage((root) => root.canvasObjects);

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return null;
    const { objectId } = object;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;
    
    const canvasObjects = storage.get('canvasObjects');
    canvasObjects.set(objectId, shapeData);
  }, []);

  const handleDeleteAllObjects = useMutation(({ storage }) => {
    const canvasObjects = storage.get('canvasObjects');
    if (!canvasObjects || canvasObjects.size===0) 
      return true;

    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }

    return canvasObjects.size===0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get('canvasObjects');
    canvasObjects.delete(objectId)
  }, []);

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      case 'reset':
        handleDeleteAllObjects();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;

      case 'delete':
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;
        
      case 'image':
        imageInputRef.current?.click();
        isDrawing.current = false;

        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = false;
        }
        setActiveElement(defaultNavElement);
        break;

      default:
        selectedShapeRef.current = elem?.value as string;
        break;
    }

  }

  useEffect(() => {
    const canvas = initializeFabric({
      fabricRef, canvasRef
    });

    canvas.on('mouse:down', (options: any) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef
      });
    })

    canvas.on('mouse:move', (options: any) => {
      handleCanvasMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage
      });
    })

    canvas.on('mouse:up', () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef
      });
    })

    canvas.on('object:modified', (options: any) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage
      })
    })

    canvas.on('selection:created', (options: any) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes
      })
    })

    canvas.on('object:scaling', (options: any) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes
      })
    })

    canvas.on('path:created', (options: any) => {
      handlePathCreated({
        options,
        syncShapeInStorage
      })
    })

    window.addEventListener('resize', () => {
      handleResize({ canvas: fabricRef.current });
    })

    window.addEventListener('keydown', (e: any) => {
      handleKeyDown({
        e,
        canvas,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage
      })
    })

    return () => {
      canvas.dispose();
    }

  }, []);

  useEffect(() => {
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef
    })
  }, [canvasObjects]);


  return (
    <main className="h-screen overflow-hidden">
      <Navbar 
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageInputRef}
        handleImageUpload={(e: any) => {
          e.stopPropagation();
          handleImageUpload({
            file: e.target.files[0],
            canvas: fabricRef as any,
            shapeRef,
            syncShapeInStorage
          })
        }}
      />
      <section className="h-full w-full flex flex-row">
        <LeftSidebar allShapes={Array.from(canvasObjects)} />
        <Live canvasRef={canvasRef} canvasBackgroundColor={canvasAttributes.backgroundColor} undo={undo} redo={redo} />
        <RightSidebar 
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          isEditingRef={isEditingRef}
          fabricRef={fabricRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
          canvasAttributes={canvasAttributes}
          setCanvasAttributes={setCanvasAttributes}
        />
      </section>
    </main>
  );
}
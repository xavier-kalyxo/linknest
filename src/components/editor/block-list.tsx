"use client";

import { useState, useCallback, useRef } from "react";
import type { InferSelectModel } from "drizzle-orm";
import type { blocks as blocksSchema } from "@/lib/db/schema";
import type { ThemeTokens } from "@/lib/templates/theme";
import {
  VALID_VARIANTS,
  ALL_BUTTON_STYLES,
  type BlockStyleOverrides,
  type BlockVariant,
} from "@/lib/templates/theme";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
} from "@/lib/actions/blocks";

type Block = InferSelectModel<typeof blocksSchema>;

interface BlockListProps {
  pageId: string;
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  plan: "free" | "pro";
  theme: ThemeTokens;
}

export function BlockList({ pageId, blocks, onBlocksChange, plan, theme }: BlockListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const sorted = [...blocks].sort((a, b) => a.position - b.position);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sorted.findIndex((b) => b.id === active.id);
      const newIndex = sorted.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(sorted, oldIndex, newIndex).map((b, i) => ({
        ...b,
        position: i,
      }));

      // Optimistic update
      onBlocksChange(reordered);

      // Persist
      await reorderBlocks({
        pageId,
        blockIds: reordered.map((b) => b.id),
      });
    },
    [sorted, pageId, onBlocksChange],
  );

  const handleAddBlock = useCallback(
    async (type: "link" | "header" | "text" | "divider" | "image") => {
      setIsAdding(true);
      const result = await createBlock({
        pageId,
        type,
        label:
          type === "link"
            ? "New Link"
            : type === "header"
              ? "Heading"
              : type === "text"
                ? "Text block"
                : undefined,
      });

      if (result.block) {
        onBlocksChange([...blocks, result.block]);
      }
      setIsAdding(false);
    },
    [pageId, blocks, onBlocksChange],
  );

  const handleUpdateBlock = useCallback(
    async (blockId: string, updates: Partial<Block>) => {
      // Optimistic
      onBlocksChange(
        blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
      );

      // Convert null values to undefined for Zod compatibility
      const clean: Record<string, unknown> = { id: blockId };
      if (updates.label !== undefined) clean.label = updates.label ?? undefined;
      if (updates.url !== undefined) clean.url = updates.url ?? "";
      if (updates.isVisible !== undefined) clean.isVisible = updates.isVisible;
      if (updates.content !== undefined) clean.content = updates.content;

      await updateBlock(clean as Parameters<typeof updateBlock>[0]);
    },
    [blocks, onBlocksChange],
  );

  const handleDeleteBlock = useCallback(
    async (blockId: string) => {
      onBlocksChange(blocks.filter((b) => b.id !== blockId));
      await deleteBlock(blockId);
    },
    [blocks, onBlocksChange],
  );

  const handleMoveBlock = useCallback(
    async (blockId: string, direction: "up" | "down") => {
      const idx = sorted.findIndex((b) => b.id === blockId);
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return;

      const reordered = arrayMove(sorted, idx, targetIdx).map((b, i) => ({
        ...b,
        position: i,
      }));

      // Optimistic update
      onBlocksChange(reordered);

      // Persist
      await reorderBlocks({
        pageId,
        blockIds: reordered.map((b) => b.id),
      });
    },
    [sorted, pageId, onBlocksChange],
  );

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sorted.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {sorted.map((block, index) => (
            <SortableBlockItem
              key={block.id}
              block={block}
              isFirst={index === 0}
              isLast={index === sorted.length - 1}
              plan={plan}
              theme={theme}
              onUpdate={handleUpdateBlock}
              onDelete={handleDeleteBlock}
              onMove={handleMoveBlock}
            />
          ))}
        </SortableContext>
      </DndContext>

      {sorted.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">
          No blocks yet. Add your first link!
        </p>
      )}

      {/* Add block buttons */}
      <div className="space-y-2 pt-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Add block
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { type: "link", label: "Link" },
              { type: "header", label: "Header" },
              { type: "text", label: "Text" },
              { type: "divider", label: "Divider" },
              { type: "image", label: "Image" },
            ] as const
          ).map(({ type, label }) => (
            <button
              key={type}
              onClick={() => handleAddBlock(type)}
              disabled={isAdding}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Block Item ────────────────────────────────────────────────────

function SortableBlockItem({
  block,
  isFirst,
  isLast,
  plan,
  theme,
  onUpdate,
  onDelete,
  onMove,
}: {
  block: Block;
  isFirst: boolean;
  isLast: boolean;
  plan: "free" | "pro";
  theme: ThemeTokens;
  onUpdate: (id: string, updates: Partial<Block>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const content = (block.content ?? {}) as Record<string, unknown>;
  const overrides = (content.styleOverrides ?? {}) as BlockStyleOverrides;

  const handleStyleChange = useCallback(
    (updates: Partial<BlockStyleOverrides>) => {
      const newOverrides = { ...overrides, ...updates };
      // Remove undefined/null keys
      for (const k of Object.keys(newOverrides)) {
        if ((newOverrides as Record<string, unknown>)[k] === undefined) {
          delete (newOverrides as Record<string, unknown>)[k];
        }
      }
      onUpdate(block.id, {
        content: { ...content, styleOverrides: newOverrides } as Record<string, unknown>,
      });
    },
    [block.id, content, overrides, onUpdate],
  );

  const handleResetStyle = useCallback(() => {
    const { styleOverrides: _, ...rest } = content;
    onUpdate(block.id, { content: rest as Record<string, unknown> });
  }, [block.id, content, onUpdate]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-gray-200 bg-white"
    >
      <div className="flex items-center gap-2 p-3">
        {/* Drag handle (desktop only) */}
        <button
          {...attributes}
          {...listeners}
          className="hidden cursor-grab text-gray-400 hover:text-gray-600 md:block"
          aria-label="Drag to reorder"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M5 3h2v2H5zM9 3h2v2H9zM5 7h2v2H5zM9 7h2v2H9zM5 11h2v2H5zM9 11h2v2H9z" />
          </svg>
        </button>

        {/* Arrow buttons (mobile only) */}
        <div className="flex gap-1 md:hidden">
          <button
            onClick={() => onMove(block.id, "up")}
            disabled={isFirst}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
            aria-label="Move up"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3l-6 6h12z" />
            </svg>
          </button>
          <button
            onClick={() => onMove(block.id, "down")}
            disabled={isLast}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
            aria-label="Move down"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 13l6-6H2z" />
            </svg>
          </button>
        </div>

        {/* Block type badge */}
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500">
          {block.type}
        </span>

        {/* Label */}
        <span className="flex-1 truncate text-sm">
          {block.label || block.url || block.type}
        </span>

        {/* Actions */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {isEditing ? "Done" : "Edit"}
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Delete
        </button>
      </div>

      {/* Expanded edit form */}
      {isEditing && (
        <div className="space-y-3 border-t border-gray-100 p-3">
          {(block.type === "link" ||
            block.type === "header" ||
            block.type === "text") && (
            <div>
              <label className="text-xs font-medium text-gray-500">Label</label>
              <input
                type="text"
                value={block.label ?? ""}
                onChange={(e) => onUpdate(block.id, { label: e.target.value })}
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-gray-400"
              />
            </div>
          )}
          {block.type === "link" && (
            <div>
              <label className="text-xs font-medium text-gray-500">URL</label>
              <input
                type="url"
                value={block.url ?? ""}
                onChange={(e) => onUpdate(block.id, { url: e.target.value })}
                placeholder="https://"
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-gray-400"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Visible</label>
            <input
              type="checkbox"
              checked={block.isVisible}
              onChange={(e) =>
                onUpdate(block.id, { isVisible: e.target.checked })
              }
              className="rounded"
            />
          </div>

          {/* Block style editor — link blocks only */}
          {block.type === "link" && (
            <BlockStyleEditor
              overrides={overrides}
              plan={plan}
              theme={theme}
              onChange={handleStyleChange}
              onReset={handleResetStyle}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Block Style Editor ──────────────────────────────────────────────────────

function BlockStyleEditor({
  overrides,
  plan,
  theme,
  onChange,
  onReset,
}: {
  overrides: BlockStyleOverrides;
  plan: "free" | "pro";
  theme: ThemeTokens;
  onChange: (updates: Partial<BlockStyleOverrides>) => void;
  onReset: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const colorDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleColorChange = useCallback(
    (key: "bgColor" | "textColor", value: string) => {
      clearTimeout(colorDebounceRef.current);
      colorDebounceRef.current = setTimeout(() => {
        onChange({ [key]: value });
      }, 500);
    },
    [onChange],
  );

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="border-t border-gray-100 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-xs font-medium text-gray-500"
      >
        <span>Style</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M6 8L2 4h8z" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-3">
          {/* Variant presets (all plans) */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Preset
            </label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <button
                onClick={() => onChange({ variant: undefined })}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                  !overrides.variant
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Default
              </button>
              {VALID_VARIANTS.map((v) => (
                <button
                  key={v}
                  onClick={() => onChange({ variant: v })}
                  className={`rounded px-2 py-1 text-[11px] font-medium capitalize transition-colors ${
                    overrides.variant === v
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Pro controls */}
          {plan === "pro" ? (
            <>
              {/* Button style */}
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  Button style
                </label>
                <select
                  value={overrides.buttonStyle ?? ""}
                  onChange={(e) =>
                    onChange({
                      buttonStyle: (e.target.value || undefined) as BlockStyleOverrides["buttonStyle"],
                    })
                  }
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-gray-400"
                >
                  <option value="">Theme default</option>
                  {ALL_BUTTON_STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    Background
                  </label>
                  <div className="mt-1 flex items-center gap-1.5">
                    <input
                      type="color"
                      defaultValue={overrides.bgColor ?? theme.colorSurface}
                      onChange={(e) => handleColorChange("bgColor", e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded border border-gray-200"
                    />
                    <span className="text-[10px] text-gray-400">
                      {overrides.bgColor ?? "auto"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    Text
                  </label>
                  <div className="mt-1 flex items-center gap-1.5">
                    <input
                      type="color"
                      defaultValue={overrides.textColor ?? theme.colorText}
                      onChange={(e) => handleColorChange("textColor", e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded border border-gray-200"
                    />
                    <span className="text-[10px] text-gray-400">
                      {overrides.textColor ?? "auto"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Border radius */}
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  Border radius ({overrides.borderRadius ?? theme.buttonRadius}px)
                </label>
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={overrides.borderRadius ?? theme.buttonRadius}
                  onChange={(e) =>
                    onChange({ borderRadius: Number(e.target.value) })
                  }
                  className="mt-1 w-full"
                />
              </div>

              {/* Shadow */}
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  Shadow
                </label>
                <div className="mt-1 flex gap-1.5">
                  {(["none", "sm", "md"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onChange({ shadow: s })}
                      className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                        (overrides.shadow ?? "none") === s
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {s === "none" ? "None" : s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-gray-400">
              Upgrade to Pro for custom colors, button styles, and more.
            </p>
          )}

          {/* Reset */}
          {hasOverrides && (
            <button
              onClick={onReset}
              className="text-[11px] text-gray-400 underline hover:text-gray-600"
            >
              Reset to theme default
            </button>
          )}
        </div>
      )}
    </div>
  );
}

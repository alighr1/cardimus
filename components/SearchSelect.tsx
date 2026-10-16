"use client";
import { useEffect, useRef } from "react";
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";

export type Option = { value: string; label: string };

/** Searchable single select (Tom Select). `options` should be a stable (memoized) array. */
export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const tsRef = useRef<TomSelect | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!selectRef.current) return;
    const ts = new TomSelect(selectRef.current, {
      maxItems: 1,
      allowEmptyOption: true,
      placeholder,
      plugins: ["dropdown_input"], // search box inside the dropdown (works well on phones)
      valueField: "value",
      labelField: "label",
      searchField: ["label"],
      sortField: undefined, // keep the given order
      maxOptions: 500,
      options,
      onChange: (v: string) => onChangeRef.current(v),
    });
    ts.setValue(valueRef.current, true);
    tsRef.current = ts;
    return () => {
      ts.destroy();
      tsRef.current = null;
    };
  }, [options, placeholder]);

  // Follow value changes made from outside (e.g. the stored value arriving after mount).
  useEffect(() => {
    const ts = tsRef.current;
    if (ts && ts.getValue() !== value) ts.setValue(value, true);
  }, [value]);

  // No Tailwind classes on the <select>: Tom Select copies them onto its wrapper, which doubled the padding.
  return <select ref={selectRef} defaultValue={value} />;
}

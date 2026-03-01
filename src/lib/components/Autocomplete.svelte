<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		optFunction: (value: string) => Promise<object[]>;
		defaultSelected: object[];
		delay?: number;
		name?: string;
		multipule?: boolean;
		optionItem?: Snippet<[object]>;
		key: string;
		placeholder?: string;
		allowNew?: boolean;
		onChange?: (value: string) => void;
		onFocusChange?: (isFocused: boolean) => void;
		selectedItem?: Snippet<[object]>;
		getItemStyle?: (item: object) => string | null;
		required?: boolean;
		allowOrderChange?: boolean;
	}
	let {
		optFunction,
		defaultSelected,
		delay = 0,
		name,
		multipule,
		optionItem,
		key,
		placeholder = '',
		allowNew = false,
		onChange,
		onFocusChange,
		selectedItem = optionItem,
		required = false,
		allowOrderChange = false, // TODO
		getItemStyle = () => null,
	}: Props = $props();
	async function oninput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (!showDropdown) {
			showDropdown = true;
		}
		if (timeout) clearTimeout(timeout);
		if (input.value.length < 1) {
			options = [];
			return;
		}
		timeout = setTimeout(async () => {
			const data = await optFunction(input.value);
			if (input.value.length < 1) {
				options = [];
				return;
			}
			options = data.filter(
				(t: object) => !selection.some((s) => s[key as keyof typeof s] === t[key as keyof typeof t])
			);
		}, delay);
	}
	function select(option: object) {
		if (multipule) {
			selection.push(option);
			value = selection.map((t) => t[key as keyof typeof t]).join(',');
		} else {
			selection = [option];
			value = option[key as keyof typeof option];
		}
		options = [];
		input.value = '';
		focused = 0;
	}
	let showDropdown = $state(false);
	let selection: object[] = $derived([...defaultSelected]);
	let value = $derived(defaultSelected.map((t) => t[key as keyof typeof t]).join(','));
	$effect(() => {
		selection = [...defaultSelected];
		value = defaultSelected.map((t) => t[key as keyof typeof t]).join(',');
	});
	let options = $state<{[key: string]: unknown}[]>([]);
	$effect(() => {
		if (onChange) onChange(value);
	});
	let timeout: Timer;
	let input: HTMLInputElement;
	let focused = $state(0);
	// making this $state() not necessary
	// svelte-ignore non_reactive_update 
	let dropdown: HTMLUListElement;
	$effect(() => {
        if (focused === -1) return; // effect bait
		if (!dropdown) return;
		dropdown.scroll({top: (focused + 1) * dropdown.scrollHeight / options.length - dropdown.clientHeight, behavior: 'smooth'});
	});
</script>

<input id={name} {required} type="text" hidden bind:value {name} class="u-none" />
<div class="autocomplete" class:multipule>
	<div class="autocomplete-input-field" class:autocomplete-focused={showDropdown}>
		{#if multipule && selection.length > 0}
			<ul class="autocomplete-selected-list">
				{#each selection as selected (selected[key as keyof typeof selected])}
					<button
						class="autocomplete-selected"
						onclick={() => {
							selection.splice(selection.indexOf(selected), 1);
							value = selection.map((t) => t[key as keyof typeof t]).join(',');
						}}
						style={getItemStyle(selected)}
					>
						<li>
						    {#if selectedItem}
						        {@render selectedItem(selected)}
							{:else}
							    {selected[key as keyof typeof selected]}
							{/if}
						</li>
						x
					</button>
				{/each}
			</ul>
		{/if}
		{#if !multipule && selection.length > 0}
			{#if selectedItem}
			    {@render selectedItem(selection[0])}
			{:else}
			    {selection[0][key as keyof (typeof selection)[0]]}
			{/if}
            
        {/if}
		<div class="autocomplete-input">
			<input
				{placeholder}
				id="autocomplete-input"
				bind:this={input}
				type="text"
				autocomplete="off"
				oninput={(e) => oninput(e)}
				onfocus={() => {
				    if (onFocusChange) {
				        onFocusChange(true);
				    }
					showDropdown = true;
				}}
				onblur={() => {
                    if (onFocusChange) {
                        onFocusChange(false);
                    }
					showDropdown = false;
				}}
				onkeydown={(e) => {
					if (e.key == 'ArrowDown') {
						e.preventDefault();
						focused = (focused + 1) % options.length;
					}
					if (e.key == 'ArrowUp') {
						e.preventDefault();
						focused = (focused + options.length - 1) % options.length;
					}
					if (e.key == 'Enter') {
						e.preventDefault();
					}
					if (e.key == 'Enter' && options.length > 0) {
						select(options[focused]);
					}
					if (e.key == 'Enter' && input.value.length >= 1) {
						if (allowNew) {
							select({ [key]: input.value });
						}
					}
					if (e.key == 'Backspace' && !multipule && selection.length > 0 && input.value.length === 0) {
						selection = [];
						value = '';
					}
				}}
				role="combobox"
				aria-controls="autocomplete-list"
				aria-expanded={showDropdown}
			/>

		</div>
	</div>
	{#if showDropdown && options.length > 0}
		<ul
			id="autocomplete-list"
			class="autocomplete-list"
			role="listbox"
			bind:this={dropdown}
			aria-expanded={showDropdown}
			aria-labelledby="autocomplete-input"
		>
			{#each options as option, index (index)}
				<div
					tabindex="0"
					class="autocomplete-option"
					class:focused={index === focused}
					onclick={() => select(option)}
					onmousedown={(e) => e.preventDefault()}
					onkeydown={(e) => {
						if (e.key == 'Enter') {
							e.preventDefault();
							select(option);
						}
					}}
					role="option"
					aria-selected={index === focused}
					style={getItemStyle(option)}
				>
					{#if optionItem}
						{@render optionItem(option)}
					{:else}
						<li>
							<p>{option[key]}</p>
						</li>
					{/if}
				</div>
			{/each}
		</ul>
	{/if}
</div>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.autocomplete {
		position: relative;
		width: 100%;
	}
	.autocomplete-selected-list {
		display: flex;
		flex-direction: row;
	}
	.autocomplete-input-field {
		border: none;
		border-bottom: 1px solid var(--color-accent);
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: start;
		overflow: auto;
	}
	.autocomplete-focused {
		border-color: var(--color-primary);
	}
	.autocomplete-input {
	    flex: auto;
	}
	#autocomplete-input {
	    width: 100%;
		border: none;
		display: block;
	}
	#autocomplete-input {
		min-width: 110px;
	}
	#autocomplete-input:focus {
		outline: none;
	}
	.autocomplete-list {
		position: absolute;
		top: calc(100% + 5px);
		left: 0;
		width: 100%;
		max-height: 200px;
		overflow-y: scroll;
		background-color: var(--bg-color);
		z-index: 1;
	}
	.autocomplete-option {
		cursor: pointer;
		padding: 8px;
	}
	.autocomplete-option p {
		margin: 0;
	}
	.focused {
		background-color: var(--color-accent-fill);
		border: 1px solid var(--color-accent);
	}
	button {
		padding: 0;
		border: none;
	}
	.autocomplete-selected {
		border-radius: 10px;
		margin: 5px;
		display: flex;
		gap: 8px;
		flex-direction: row;
		align-items: center;
		padding: 5px 10px;
		border: 1px solid var(--color-accent);
	}
	.autocomplete-selected:hover {
		background-color: var(--color-accent-fill);
	}
</style>

<script lang="ts">
	interface Props {
		optFunction: Function;
		defaultSelected: object[];
		delay?: number;
		name?: string;
		multipule?: boolean;
		optionItem?: any;
		key: string;
		allowNew?: boolean;
	}
	let {
		optFunction,
		defaultSelected,
		delay = 0,
		name,
		multipule,
		optionItem,
		key,
		allowNew = false
	}: Props = $props();
	async function oninput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
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
			options = data.filter((t: object) => !selection.some((s) => s[key as keyof typeof s] === t[key as keyof typeof t]));
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
	let selection: object[] = $state([...defaultSelected]);
	let options = $state([]);
	let value = $state(defaultSelected.map((t) => t[key as keyof typeof t]).join(','));
	let timeout: Timer;
	let input: HTMLInputElement;
	let focused = $state(0);
</script>

<input type="text" hidden bind:value {name} class="u-none" />
<div class="autocomplete" class:multipule>
	<div class="autocomplete-input-field"  class:autocomplete-focused={showDropdown}>
        {#if multipule && selection.length > 0}
            <ul class="autocomplete-selected-list">
                {#each selection as selected}
                <button class="autocomplete-selected" onclick={() => selection.splice(selection.indexOf(selected), 1)}>
                    <li>
                        {selected[key as keyof typeof selected]}
                    </li>
                    x
                </button>
                {/each}
            </ul>
        {/if}
        <div class="autocomplete-input">
            <input
                id="autocomplete-input"
                bind:this={input}
                type="text"
                oninput={(e) => oninput(e)}
                onfocus={() => {
                    showDropdown = true;
                }}
                onblur={() => {
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
                }}
                role="combobox"
                aria-controls="autocomplete-list"
                aria-expanded={showDropdown}
            />
            {#if !multipule}
                {selection[0][key as keyof typeof selection[0]]}
            {/if}
        </div>
    </div>
	{#if showDropdown && options.length > 0}
		<ul
			id="autocomplete-list"
			class="autocomplete-list"
			role="listbox"
			aria-expanded={showDropdown}
			aria-labelledby="autocomplete-input"
		>
			{#each options as option, index}
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
        overflow: scroll;
    }
    .autocomplete-focused {
        border-color: var(--color-primary);
    }
    .autocomplete-input, #autocomplete-input {
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
        background-color: #bc45c050;
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
        background-color: #bc45c050;
    }
</style>

import * as React from 'react';
import {
    Dropdown,
    IDropdownOption,
    IDropdownProps,
    IDropdownStyles,
    ISearchBoxProps,
    ISelectableOption,
    SearchBox,
    SelectableOptionMenuItemType
} from 'office-ui-fabric-react';

export interface ISearchableDropdownProps extends IDropdownProps {
    onSearchValueChanged(searchValue: string): void;
    searchboxProps?: Omit<ISearchBoxProps, 'onChange' | 'onClear' | 'onSearch'>;
}



const SearchableDropdown = (props: ISearchableDropdownProps) => {
    const getOptions = (): IDropdownOption[] => {
        const result: IDropdownOption[] = [];

        result.push({
            key: 'search',
            text: '',
            itemType: SelectableOptionMenuItemType.Header
        });

        return result.concat([...props.options]);
    }

    const onRenderOption = (
        option?: ISelectableOption,
        defaultRender?: (props?: ISelectableOption) => JSX.Element | null,
    ): JSX.Element | null => {
        if (!option) {
            return null;
        }

        if (option.itemType === SelectableOptionMenuItemType.Header && option.key === 'search') {
            return (
                <SearchBox
                    {...props.searchboxProps}
                    onChange={(
                        _,
                        newValue?: string,
                    ): void => {
                        if (typeof props.onSearchValueChanged === 'function') {
                            props.onSearchValueChanged(newValue || '');
                        }
                    }}
                    onSearch={(newValue: string): void => {
                        if (typeof props.onSearchValueChanged === 'function') {
                            props.onSearchValueChanged(newValue);
                        }
                    }}
                    onClear={() => {
                        if (typeof props.onSearchValueChanged === 'function') {
                            props.onSearchValueChanged('');
                        }
                    }}
                />
            );
        }

        if (typeof props.onRenderOption === 'function') {
            return props.onRenderOption(option, defaultRender);
        }

        if (!defaultRender) {
            return null;
        }

        return defaultRender(option);
    }

    const dropdownStyles: Partial<IDropdownStyles> = {
        dropdownItemSelected: {
          selectors: {
            '&:before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'rgb(0, 120, 212)',
            },
          },
        },
        dropdownItemsWrapper: {
            paddingTop: '44px',
        },
        dropdownItemHeader: {
            position: 'fixed',
            top: '0px',
            paddingTop: '6px',
            background: 'white !important',
            width: '94%',
            zIndex: 1,
        }
      };


    return (
        <Dropdown
            {...props}
            styles={dropdownStyles}
            options={getOptions()}
            onRenderOption={(
                option?: ISelectableOption,
                defaultRender?: (props?: ISelectableOption) => JSX.Element | null,
            ): JSX.Element | null => {
                return onRenderOption(option, defaultRender);
            }}
        />
    );
};

export default SearchableDropdown;
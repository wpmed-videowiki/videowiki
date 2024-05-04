import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalActions,
  Button,
  Dropdown,
  Input,
} from "semantic-ui-react";
import { filter, startsWith, lowerCase } from "lodash";
import { isoLangsArray, isoLangs } from "../../../utils/langs";

const languagesOptions = isoLangsArray.map((lang) => ({
  key: lang.code,
  value: lang.code,
  text: `${lang.name}`,
}));

function filterDisabledLangs(langs, disabledLangs) {
  return langs.filter((lang) => disabledLangs.indexOf(lang.value) === -1);
}

interface IAddHumanVoiceModalProps {
  open?: boolean;
  disabled?: boolean;
  onClose?: () => void;
  onSkip?: () => void;
  onSubmit?: (lang: string) => void;
  skippable?: boolean;
  disabledLanguages?: string[];
  defaultValue?: string;
}

const AddHumanVoiceModal = (data: IAddHumanVoiceModalProps) => {
  const props = {
    open: false,
    skippable: true,
    onClose: () => {},
    onSkip: () => {},
    onSubmit: () => {},
    disabledLanguages: [],
    disabled: false,
    defaultValue: "",
    ...data,
  };
  const [state, updateState] = useState({
    language: props.defaultValue,
    dropdownOptions: languagesOptions.slice(),
    searchValue: "",
  });

  const setState = (data) => {
    updateState((state) => ({ ...state, ...data }));
  };
  useEffect(() => {
    if (props.disabledLanguages && props.disabledLanguages.length > 0) {
      const availableLangs = state.dropdownOptions.filter(
        (lang) => props.disabledLanguages.indexOf(lang.value) === -1
      );
      setState({ dropdownOptions: availableLangs });
    }
  }, [props.disabledLanguages]);

  const onInputClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onChange = (e) => {
    const searchQuery = e.target.value;
    if (searchQuery === "") {
      setState({
        dropdownOptions: filterDisabledLangs(
          languagesOptions,
          props.disabledLanguages
        ),
        searchValue: "",
      });
      return;
    }
    const r = filter(languagesOptions, (o) =>
      startsWith(lowerCase(o.text), lowerCase(searchQuery))
    );
    setState({
      dropdownOptions: filterDisabledLangs(r, props.disabledLanguages),
      searchValue: searchQuery,
    });
  };

  return (
    <Modal
      size="tiny"
      open={props.open}
      className="c-add-human-voice-modal"
      onClose={props.onClose}
    >
      <ModalContent className="c-add-human-voice-modal__content">
        <h3>Add Human Voice Over In:</h3>
        <Dropdown
          fluid
          text={`${
            state.language && isoLangs[state.language]
              ? isoLangs[state.language].name
              : "Select Language"
          }`}
          disabled={props.disabled}
          className="icon"
          onChange={onChange.bind(this)}
        >
          <Dropdown.Menu style={{ width: "100%" }}>
            <Input
              icon="search"
              iconPosition="left"
              className="search"
              onClick={onInputClick.bind(this)}
              value={state.searchValue}
            />
            <Dropdown.Menu scrolling>
              {state.dropdownOptions.map((option) => (
                <Dropdown.Item
                  {...option}
                  key={option.value}
                  onClick={() =>
                    setState({
                      language: option.value,
                      searchValue: "",
                      dropdownOptions: languagesOptions,
                    })
                  }
                />
              ))}
            </Dropdown.Menu>
          </Dropdown.Menu>
        </Dropdown>
      </ModalContent>
      <ModalActions>
        {props.skippable ? (
          <Button color="blue" onClick={() => props.onSkip()}>
            Use machine voice
          </Button>
        ) : (
          <Button onClick={props.onClose}>Cancel</Button>
        )}
        <Button onClick={() => props.onSubmit(state.language)}>
          Use your own voice
        </Button>
      </ModalActions>
    </Modal>
  );
};

export default AddHumanVoiceModal;

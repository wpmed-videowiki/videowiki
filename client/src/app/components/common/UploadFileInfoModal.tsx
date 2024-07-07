import { useEffect } from "react";
import request from "../../utils/requestAgent";
import {
  Progress,
  Modal,
  Form,
  Button,
  Icon,
  Search,
  Grid,
  Label,
  Dropdown,
  TextArea,
  Popup,
  Loader,
  Input,
  Checkbox,
} from "semantic-ui-react";
import {
  ownworkLicenceOptions,
  othersworkLicenceOptions,
} from "./licenceOptions";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  clearSlideForm,
  fetchCategoriesFromWikimediaCommons,
  getArticleForms,
  updateCommonsUploadFormField,
} from "../../slices/wikiSlice";
import {
  onSetUploadProgress,
  onUploadContentFailure,
  onUploadContentLoading,
  onUploadContentSuccess,
} from "../../slices/articleSlice";
import { LoadingStateEnum } from "../../../types/types";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const uploadFormFields = {
  fileType: "",

  tempLoading: false,
  submitLoading: false,
  submitLoadingInterval: null,
  submitLoadingPercentage: 0,

  fileSrc: null,
  title: "",
  description: "",
  categoriesSearchText: "",
  categories: [],
  licence: ownworkLicenceOptions[0].value,
  licenceText: ownworkLicenceOptions[0].value,
  licenceSection: "",
  source: "own",
  sourceUrl: "",
  sourceAuthors: "",
  date: "",
  saveTemplate: false,

  titleDirty: false,
  descriptionDirty: false,
  categoriesDirty: false,
  sourceUrlDirty: false,
  sourceAuthorsDirty: false,
  dateDirty: false,

  titleError: "",
  titleLoading: false,
  withSubtitles: false,

  extraUsersInput: "",
  addExtraUsers: false,
  extraUsers: [],
};

const styles = {
  successCheckmark: {
    color: "green",
  },
  errorCheckmark: {
    color: "red",
  },
};

const stringTextLimit = 5;

interface IUploadFileInfoModalProps {
  articleForms?: any[];
  standalone?: boolean;
  withSubtitles?: boolean;
  uploadMessage?: string;
  subTitle?: string;
  initialFormValues?: any;
  disabledFields?: any[];
  showExtraUsers?: boolean;
  showAutoDownload?: boolean;
  uploadForms?: any[];
  articleId: string;
  currentSlideIndex: number | string;
  title: string;
  wikiSource: string;
  file?: any;
  isUploadResume?: boolean;
  visible: boolean;
  onClose: () => void;
  onSubmit?: (formValues: any) => void;
}

const UploadFileInfoModal = ({
  articleForms = [],
  standalone = false,
  withSubtitles = false,
  uploadMessage = "Hold on tight! We are uploading your media directly to Wikimedia Commons",
  subTitle = "",
  initialFormValues = {},
  disabledFields = [],
  showExtraUsers = false,
  showAutoDownload = false,
  uploadForms = [],
  articleId,
  currentSlideIndex,
  title,
  file,
  isUploadResume,
  wikiSource,
  onClose,
  onSubmit = () => {},
  visible,
}: IUploadFileInfoModalProps) => {
  const { fetchCategoriesFromWikimediaCommonsState, searchCategories } =
    useAppSelector((state) => state.wiki);
  const { uploadProgress, uploadStatus } = useAppSelector(
    (state) => state.article
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const sourceOptions = [
    {
      text: t("UploadFileInfoModal.source_option_own_work"),
      value: "own",
    },
    {
      text: t("UploadFileInfoModal.source_option_others"),
      value: "others",
    },
  ];

  const getFormFields = () => {
    return (
      (uploadForms[articleId] && uploadForms[articleId][currentSlideIndex]) ||
      false
    );
  };

  const updateField = (updateObject) => {
    if (disabledFields.length > 0) {
      Object.keys(updateObject).forEach((key) => {
        if (disabledFields.indexOf(key) > -1) {
          /* eslint-disable prefer-reflect */
          delete updateObject[key];
        }
      });
    }

    dispatch(
      updateCommonsUploadFormField({
        articleId,
        slideIndex: currentSlideIndex,
        update: updateObject,
      })
    );
  };

  const uploadTempFile = () => {
    dispatch(onUploadContentLoading());
    updateField({ tempLoading: true });

    request
      .post("/api/wiki/article/uploadTemp")
      .field("wikiSource", wikiSource)
      .field("title", title)
      .field("slideNumber", currentSlideIndex)
      .attach("file", file)
      .on("progress", (event) => {
        dispatch(onSetUploadProgress(event.percent));
      })
      .end((err, { body }) => {
        updateField({ tempLoading: false });

        if (err) {
          dispatch(onUploadContentFailure());
        } else {
          updateField({ fileSrc: body.filepath });
        }
        dispatch(onUploadContentSuccess(body));
      });
  };

  const uploadFileToWikiCommons = (data) => {
    const submitInterval = setInterval(() => {
      updateField({
        submitLoadingPercentage:
          getFormFields().submitLoadingPercentage <= 70
            ? getFormFields().submitLoadingPercentage + 20
            : getFormFields().submitLoadingPercentage,
      });
    }, 3000);

    updateField({
      submitLoading: true,
      submitLoadingPercentage: 10,
      submitLoadingInterval: submitInterval,
    });

    const uploadRequest = request
      .post("/api/wiki/article/uploadCommons")
      .field("title", title)
      .field("wikiSource", wikiSource)
      .field("slideNumber", currentSlideIndex)
      .field("file", getFormFields().fileSrc)
      .timeout({ deadline: 5 * 60 * 1000 });
    // attach given fields in the request
    console.log("data", data);
    Object.keys(data)
      .filter((key) => data[key])
      .forEach((key) => {
        uploadRequest.field(key, data[key]);
      });

    uploadRequest.end((err, { text, body }) => {
      if (!err) {
        toast.success(t("UploadFileInfoModal.upload_succes"));
        updateField({
          submitLoading: false,
          submitLoadingPercentage: 100,
        });
        dispatch(onUploadContentSuccess(uploadStatus));
        onClose();
        setTimeout(() => {
          dispatch(
            clearSlideForm({ articleId, slideIndex: currentSlideIndex })
          );
        }, 100);
      } else if (err) {
        const reason = text || t("UploadFileInfoModal.upload_error");
        toast.error(reason);
        updateField({
          submitLoading: false,
          submitLoadingPercentage: 100,
        });
      }
      clearInterval(getFormFields().submitLoadingInterval);
    });
  };

  const _handleFileUploadModalClose = () => {
    onClose && onClose();
  };

  const _onAddExtraUser = (userName) => {
    const extraUsers = getFormFields().extraUsers;
    if (extraUsers.indexOf(userName) === -1) {
      extraUsers.push(userName);
    }
    updateField({ extraUsers, extraUsersInput: "" });
  };

  const _onRemoveExtraUser = (index) => {
    const extraUsers = getFormFields().extraUsers;
    extraUsers.splice(index, 1);
    updateField({ extraUsers });
  };

  const _isFormValid = () => {
    const {
      title,
      titleError,
      titleLoading,
      description,
      categories,
      source,
      sourceAuthors,
      sourceUrl,
      date,
      submitLoading,
      tempLoading,
    } = getFormFields();
    let sourceInvalid = false;
    if (
      source === "others" &&
      (sourceAuthors.length < stringTextLimit ||
        sourceUrl.length < stringTextLimit)
    ) {
      sourceInvalid = true;
    }
    return (
      !tempLoading &&
      !submitLoading &&
      !titleError &&
      !titleLoading &&
      date &&
      title.length >= stringTextLimit &&
      description.length >= stringTextLimit &&
      categories.length > 0 &&
      !sourceInvalid
    );
  };

  const _onSubmit = (e) => {
    e.preventDefault();
    if (_isFormValid()) {
      const {
        title: fileTitle,
        description,
        categories,
        licence,
        source,
        sourceUrl,
        sourceAuthors,
        date,
        saveTemplate,
        licenceSection,
        licenceText,
        withSubtitles,
        addExtraUsers,
        extraUsers,
        autoDownload,
      } = getFormFields();

      const formValues: any = {
        fileTitle,
        description,
        categories: categories.map((category) => category.title).join(","),
        licence,
        source,
        sourceUrl,
        sourceAuthors,
        date,
        saveTemplate,
        licenceSection,
        licenceText,
        withSubtitles,
        autoDownload,
      };

      if (addExtraUsers && extraUsers.length > 0) {
        formValues.extraUsers = extraUsers;
      }

      if (standalone && onSubmit) {
        onSubmit(formValues);
        updateField({ submitLoading: true, submitLoadingPercentage: 10 });
      } else {
        uploadFileToWikiCommons(formValues);
      }
    }
  };

  const onRemoveCategory = (index) => {
    const categories = getFormFields().categories;
    categories.splice(index, 1);
    updateField({ categories });
  };

  const onTitleBlur = () => {
    let state = { titleDirty: true };
    if (getFormFields().title.length >= stringTextLimit) {
      state = Object.assign(state, { titleLoading: true, titleError: "" });
      const commonsApi = "https://commons.wikimedia.org/w/api.php";
      let filename = `File:${getFormFields().title}`;
      if (file) {
        const fileExtension =
          file.name.split(".")[file.name.split(".").length - 1];
        filename += `.${fileExtension}`;
      } else {
        filename += ".webm";
      }

      request
        .get(`/api/wiki/search?searchTerm=${filename}&wikiSource=${commonsApi}`)
        .then(
          (res) => {
            let isValid = true;
            if (res && res.body && res.body.searchResults) {
              res.body.searchResults.forEach((result) => {
                if (
                  result.title.toLowerCase() === filename.toLowerCase() &&
                  result.description === commonsApi
                ) {
                  isValid = false;
                }
              });
            }

            if (!isValid) {
              const titleError = t("UploadFileInfoModal.file_already_exists");
              updateField({ titleError, titleLoading: false });
            } else {
              updateField({ titleError: "", titleLoading: false });
            }
          },
          () => {
            updateField({ titleError: "", titleLoading: false });
          }
        );
    }

    updateField(state);
  };

  const _handleLoadFilePreview = (file, cb) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateField({ fileSrc: e.target?.result, fileType: file.type });
      cb && cb();
    };

    reader.readAsDataURL(file);
  };

  const _handleResultSelect = (e, result) => {
    const categories = getFormFields().categories.slice();
    const duplicateIndex = categories.findIndex(
      (category) => category.title === result.title
    );
    if (duplicateIndex === -1) {
      categories.push(result);
      updateField({ categoriesSearchText: "", categories });
    }
  };

  const _handleSearchChange = (e, value) => {
    updateField({ categoriesSearchText: value });
    dispatch(fetchCategoriesFromWikimediaCommons({ searchText: value }));
  };

  const _handleSourceChange = (e, { value }) => {
    if (value === "own") {
      updateField({ source: value, licence: ownworkLicenceOptions[0].value });
    } else if (value === "others") {
      updateField({
        source: value,
        licence: othersworkLicenceOptions[1].value,
        licenceText: othersworkLicenceOptions[1].text,
        licenceSection: othersworkLicenceOptions[1].section,
      });
    }
  };

  const _renderSourceInfo = () => {
    return (
      <div style={{ marginTop: "1rem" }}>
        <h4>{t("UploadFileInfoModal.source")}</h4>
        <p>{t("UploadFileInfoModal.source_description")}</p>
        <Grid>
          <Grid.Row>
            <Grid.Column width={14}>
              <Form.Input
                fluid
                value={getFormFields().sourceUrl}
                onBlur={() => {
                  updateField({ sourceUrlDirty: true });
                }}
                onChange={(e) => {
                  updateField({
                    sourceUrl: e.target.value,
                    sourceUrlDirty: true,
                  });
                }}
                disabled={disabledFields.indexOf("sourceUrl") > -1}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              {getFormFields().sourceUrlDirty &&
                getFormFields().sourceUrl.length >= stringTextLimit && (
                  <Icon name="check" style={styles.successCheckmark} />
                )}

              {getFormFields().sourceUrlDirty &&
                getFormFields().sourceUrl.length < stringTextLimit && (
                  <Icon name="close" style={styles.errorCheckmark} />
                )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <h4>{t("UploadFileInfoModal.author")}</h4>
        <p>{t("UploadFileInfoModal.author_description")}</p>
        <Grid>
          <Grid.Row>
            <Grid.Column width={14}>
              <Form.Input
                fluid
                value={getFormFields().sourceAuthors}
                onBlur={() => {
                  updateField({ sourceAuthorsDirty: true });
                }}
                onChange={(e) => {
                  updateField({
                    sourceAuthors: e.target.value,
                    sourceAuthorsDirty: true,
                  });
                }}
                disabled={disabledFields.indexOf("sourceAuthors") > -1}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              {getFormFields().sourceAuthorsDirty &&
                getFormFields().sourceAuthors.length >= stringTextLimit && (
                  <Icon name="check" style={styles.successCheckmark} />
                )}

              {getFormFields().sourceAuthorsDirty &&
                getFormFields().sourceAuthors.length < stringTextLimit && (
                  <Icon name="close" circular style={styles.errorCheckmark} />
                )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  };

  const _renderTitleField = () => {
    return (
      <Grid.Row>
        <Grid.Column width={3}>{t("UploadFileInfoModal.title")}</Grid.Column>
        <Grid.Column width={11}>
          <Input
            type="text"
            value={getFormFields().title}
            onBlur={() => onTitleBlur()}
            onChange={(e) => {
              updateField({ title: e.target.value, titleDirty: true });
            }}
            disabled={disabledFields.indexOf("title") > -1}
            required
            fluid
          />
          {getFormFields().titleError && (
            <p style={{ color: "red" }}>{getFormFields().titleError}</p>
          )}
        </Grid.Column>
        <Grid.Column width={1}>
          {getFormFields().titleLoading && (
            <Loader
              active={getFormFields().titleLoading}
              className="c-editor__upload-form__title-loader"
              size={"tiny"}
            />
          )}
          {!getFormFields().titleLoading &&
            !getFormFields().titleError &&
            getFormFields().titleDirty &&
            getFormFields().title.length >= stringTextLimit && (
              <Icon name="check circle" style={styles.successCheckmark} />
            )}

          {((!getFormFields().titleLoading &&
            getFormFields().titleDirty &&
            getFormFields().title.length < stringTextLimit) ||
            getFormFields().titleError) && (
            <Icon name="close" circular style={styles.errorCheckmark} />
          )}
        </Grid.Column>

        <Grid.Column width={1}>
          <Popup
            trigger={<Icon name="info circle" />}
            content={
              <div>
                <div>{t("UploadFileInfoModal.title_description_1")}</div>
                <div>{t("UploadFileInfoModal.title_description_2")}</div>
              </div>
            }
          />
        </Grid.Column>
      </Grid.Row>
    );
  };

  const _renderDescriptionField = () => {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          {t("UploadFileInfoModal.description")}
        </Grid.Column>
        <Grid.Column width={11}>
          <TextArea
            rows={4}
            style={{ width: "100%", resize: "none" }}
            value={getFormFields().description}
            onBlur={() => {
              updateField({ descriptionDirty: true });
            }}
            onChange={(e) => {
              updateField({
                description: e.target.value,
                descriptionDirty: true,
              });
            }}
            disabled={disabledFields.indexOf("description") > -1}
          />
        </Grid.Column>

        <Grid.Column width={1}>
          {getFormFields().descriptionDirty &&
            getFormFields().description.length >= stringTextLimit && (
              <Icon name="check circle" style={styles.successCheckmark} />
            )}

          {getFormFields().descriptionDirty &&
            getFormFields().description.length < stringTextLimit && (
              <Icon name="close" circular style={styles.errorCheckmark} />
            )}
        </Grid.Column>

        <Grid.Column width={1}>
          <Popup
            trigger={<Icon name="info circle" />}
            content={
              <div>
                {t("description_description")
                  ?.split("\n")
                  .map((item, key) => {
                    return <div key={key}>{item}</div>;
                  })}
              </div>
            }
          />
        </Grid.Column>
      </Grid.Row>
    );
  };

  const _renderLicenceField = () => {
    return (
      <Grid.Row>
        <Grid.Column width={3}>{t("UploadFileInfoModal.licence")}</Grid.Column>
        <Grid.Column width={12}>
          <Form.Field>{_renderLicenceDropdown()}</Form.Field>
        </Grid.Column>

        <Grid.Column width={1}>
          <Popup
            trigger={
              <a
                style={{ color: "black" }}
                href="https://commons.wikimedia.org/wiki/Commons:Licensing"
                target="_blank"
              >
                <Icon name="question circle" />
              </a>
            }
            content={
              <a
                href="https://commons.wikimedia.org/wiki/Commons:Licensing"
                target="_blank"
              >
                https://commons.wikimedia.org/wiki/Commons:Licensing
              </a>
            }
          />
        </Grid.Column>
      </Grid.Row>
    );
  };

  const _renderLicenceDropdown = () => {
    if (getFormFields().source === "own") {
      return (
        <Dropdown
          fluid
          selection
          value={getFormFields().licence}
          options={ownworkLicenceOptions}
          onChange={(e, { value }) => {
            updateField({ licence: value });
          }}
          disabled={disabledFields.indexOf("licence") > -1}
        />
      );
    }

    return (
      <span>
        <Dropdown
          fluid
          scrolling
          text={getFormFields().licenceText.replace("<br/>", "")}
          value={getFormFields().licence}
          disabled={disabledFields.indexOf("licence") > -1}
        >
          <Dropdown.Menu>
            {othersworkLicenceOptions.map((item, index) => {
              if (item.separator) {
                return (
                  <h5
                    style={{
                      padding: "10px",
                      margin: 0,
                      boxSizing: "border-box",
                      color: "#1678c2",
                    }}
                    key={item.text + index}
                  >
                    {item.text}:
                  </h5>
                );
              }

              return (
                <Dropdown.Item
                  key={item.text + index}
                  value={item.value}
                  active={getFormFields().licence === item.value}
                  onClick={() => {
                    updateField({
                      licence: item.value,
                      licenceText: item.text,
                      licenceSection: item.section,
                    });
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
        <span style={{ color: "#1678c2" }}>
          {getFormFields().licenceSection
            ? `${getFormFields().licenceSection} .`
            : ""}
        </span>
      </span>
    );
  };

  const _renderSourceField = () => {
    return (
      <Grid.Row>
        <Grid.Column width={3}>{t("UploadFileInfoModal.source")}</Grid.Column>
        <Grid.Column width={13}>
          <Form.Field>
            <Dropdown
              fluid
              selection
              value={getFormFields().source}
              options={sourceOptions}
              onChange={(e, { value }) => _handleSourceChange(e, { value })}
            />
          </Form.Field>
          {getFormFields().source === "others" && _renderSourceInfo()}
        </Grid.Column>
      </Grid.Row>
    );
  };

  const _renderCategoriesField = () => {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          {t("UploadFileInfoModal.categories")}
        </Grid.Column>
        <Grid.Column width={5}>
          <Search
            loading={
              fetchCategoriesFromWikimediaCommonsState ===
              LoadingStateEnum.LOADING
            }
            onBlur={() => {
              updateField({ categoriesDirty: true });
            }}
            onResultSelect={_handleResultSelect}
            onSearchChange={_handleSearchChange}
            results={searchCategories}
            value={getFormFields().categoriesSearchText}
            placeholder="search categories"
            disabled={disabledFields.indexOf("categories") > -1}
          />

          <div style={{ marginTop: ".8rem" }}>
            {getFormFields().categories.map((category, index) => (
              <Label key={category.title} style={{ marginBottom: ".6rem" }}>
                {category.title}
                {disabledFields.indexOf("categories") === -1 && (
                  <Icon name="delete" onClick={() => onRemoveCategory(index)} />
                )}
              </Label>
            ))}
          </div>
        </Grid.Column>
        <Grid.Column width={1}>
          {getFormFields().categoriesDirty &&
            getFormFields().categories.length > 0 && (
              <Icon
                name="check circle"
                style={{ color: "green", marginLeft: "22px" }}
              />
            )}

          {getFormFields().categoriesDirty &&
            getFormFields().categories.length === 0 && (
              <Icon
                name="close"
                circular
                style={{ color: "red", marginLeft: "22px" }}
              />
            )}
        </Grid.Column>
      </Grid.Row>
    );
  };

  const _renderDateField = () => {
    return (
      <Grid.Row>
        <Grid.Column width={3}>{t("UploadFileInfoModal.date")}</Grid.Column>
        <Grid.Column width={11}>
          <Input
            fluid
            type={"date"}
            value={getFormFields().date}
            onBlur={() => {
              updateField({ dateDirty: true });
            }}
            onChange={(e) => {
              updateField({ date: e.target.value, dateDirty: true });
            }}
          />
        </Grid.Column>
        <Grid.Column width={1}>
          {getFormFields().dateDirty && getFormFields().date && (
            <Icon name="check circle" style={styles.successCheckmark} />
          )}

          {getFormFields().dateDirty && !getFormFields().date && (
            <Icon name="close" circular style={styles.errorCheckmark} />
          )}
        </Grid.Column>
      </Grid.Row>
    );
  };

  const _renderSaveTemplateField = () => {
    return (
      <Grid.Row>
        <Grid.Column width={3} />
        <Grid.Column width={12}>
          <Checkbox
            label={t("UploadFileInfoModal.save_template_label")}
            checked={getFormFields().saveTemplate}
            onChange={(e, { checked }) =>
              updateField({ saveTemplate: checked })
            }
          />
        </Grid.Column>
        <Grid.Column width={1}>
          <Popup
            trigger={<Icon name="info circle" />}
            content={
              <div>{t("UploadFileInfoModal.save_template_description")}</div>
            }
          />
        </Grid.Column>
      </Grid.Row>
    );
  };

  const _renderAutoDownload = () => {
    return (
      <Grid.Row>
        <Grid.Column width={3} />
        <Grid.Column width={12}>
          <Checkbox
            label={t("UploadFileInfoModal.auto_download_label")}
            checked={getFormFields().autoDownload}
            onChange={(e, { checked }) =>
              updateField({ autoDownload: checked })
            }
          />
        </Grid.Column>
        <Grid.Column width={1}>
          <Popup
            trigger={<Icon name="info circle" />}
            content={
              <div>{t("UploadFileInfoModal.auto_download_description")}</div>
            }
          />
        </Grid.Column>
      </Grid.Row>
    );
  };

  const _renderExtraUsers = () => {
    return (
      <Grid.Row>
        <Grid.Column width={3} />
        <Grid.Column width={12}>
          <Checkbox
            label={t("UploadFileInfoModal.add_extra_users_label")}
            checked={getFormFields().addExtraUsers}
            onChange={(e, { checked }) => {
              updateField({
                addExtraUsers: checked,
                extraUsersInput: checked ? getFormFields().extraUsersInput : "",
              });
            }}
          />
          {getFormFields().addExtraUsers && (
            <div style={{ paddingLeft: 20, width: "50%" }}>
              <br />
              <ul>
                {getFormFields().extraUsers.map((user, index) => (
                  <li
                    key={`extrauser-${user}`}
                    style={{ margin: 20, marginTop: 0, position: "relative" }}
                  >
                    {user}{" "}
                    <Icon
                      name="close"
                      style={{
                        cursor: "pointer",
                        position: "absolute",
                        right: 0,
                      }}
                      onClick={() => _onRemoveExtraUser(index)}
                    />
                  </li>
                ))}
              </ul>
              <Input
                action={
                  <Button
                    primary
                    disabled={!getFormFields().extraUsersInput.trim()}
                    onClick={() =>
                      _onAddExtraUser(getFormFields().extraUsersInput.trim())
                    }
                  >
                    {t("Common.add")}
                  </Button>
                }
                placeholder={t("UploadFileInfoModal.user_name")}
                value={getFormFields().extraUsersInput}
                onChange={(e) =>
                  updateField({ extraUsersInput: e.target.value })
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    _onAddExtraUser(getFormFields().extraUsersInput.trim());
                  }
                }}
              />
            </div>
          )}
        </Grid.Column>
      </Grid.Row>
    );
  };

  const _renderwithSubtitlesField = () => {
    if (!withSubtitles) return;

    return (
      <Grid.Row>
        <Grid.Column width={3} />
        <Grid.Column width={12}>
          <Checkbox
            label={"Include Subtitles"}
            checked={getFormFields().withSubtitles}
            onChange={(e, { checked }) =>
              updateField({ withSubtitles: checked })
            }
          />
        </Grid.Column>
        <Grid.Column width={1}>
          <Popup
            trigger={<Icon name="info circle" />}
            content={
              <div>
                By selecting this field, the video will include slides text as
                subtitles
              </div>
            }
          />
        </Grid.Column>
      </Grid.Row>
    );
  };
  const _renderFileForm = () => {
    return (
      <Grid>
        {_renderTitleField()}

        {_renderDescriptionField()}

        {_renderSourceField()}

        {_renderLicenceField()}

        {_renderCategoriesField()}

        {_renderDateField()}

        {_renderSaveTemplateField()}

        {/* {this._renderwithSubtitlesField()} */}

        {showAutoDownload && _renderAutoDownload()}

        {showExtraUsers && _renderExtraUsers()}

        <Grid.Row style={{ display: "flex", justifyContent: "center" }}>
          {!getFormFields().submitLoading && (
            <Button
              primary
              disabled={!_isFormValid()}
              onClick={(e) => _onSubmit(e)}
            >
              {t("UploadFileInfoModal.upload_to_commons")}
            </Button>
          )}
          {getFormFields().submitLoading &&
            getFormFields().submitLoadingPercentage < 100 && (
              <Progress
                style={{ marginBottom: "3rem !important" }}
                className="c-upload-progress"
                percent={Math.floor(getFormFields().submitLoadingPercentage)}
                progress
                indicating
              >
                {uploadMessage}
              </Progress>
            )}
        </Grid.Row>
      </Grid>
    );
  };

  const _renderFilePreview = () => {
    const { fileSrc, fileType } = getFormFields();
    if (!fileSrc || !fileType) return;

    let content: any = "";

    if (fileType.indexOf("image") > -1) {
      content = (
        <img
          src={fileSrc}
          alt={"File image"}
          style={{ width: "100%", height: "100%" }}
        />
      );
    } else if (fileType.indexOf("video") > -1) {
      content = (
        <video
          src={fileSrc}
          controls
          autoPlay
          muted
          height={"100%"}
          width={"100%"}
        />
      );
    } else {
      return "";
    }

    return <div style={{ margin: "1.5rem auto", width: "40%" }}>{content}</div>;
  };

  useEffect(() => {
    if (!uploadForms[articleId] || !uploadForms[articleId][currentSlideIndex]) {
      const initialFormValues2 = initialFormValues
        ? { ...uploadFormFields, ...initialFormValues }
        : uploadFormFields;

      dispatch(
        updateCommonsUploadFormField({
          articleId,
          slideIndex: currentSlideIndex,
          update: initialFormValues2,
        })
      );
    }
    if (!standalone && file && !isUploadResume) {
      _handleLoadFilePreview(file, () => {
        uploadTempFile();
      });
    }
    dispatch(getArticleForms({ title }));
  }, []);

  if (!getFormFields()) return <div>{t("Common.loading")}</div>;

  return (
    <Modal
      style={{
        marginTop: "0px !important",
        marginLeft: "auto",
        marginRight: "auto",
      }}
      open={getFormFields() && visible}
      onClose={() => _handleFileUploadModalClose()}
      size="small"
    >
      <Modal.Header
        style={{
          textAlign: "center",
          backgroundColor: "#1678c2",
          color: "white",
        }}
      >
        {t("UploadFileInfoModal.header")}
        {subTitle && <small style={{ display: "block" }}>{subTitle}</small>}
        <div style={{ position: "absolute", top: 20, right: 10 }}>
          <Popup
            position="bottom right"
            trigger={
              <a
                style={{ float: "right", color: "white" }}
                href="https://commons.wikimedia.org/wiki/Commons:Project_scope"
                target="_blank"
              >
                <Icon name="info circle" />
              </a>
            }
            content={
              <a
                href="https://commons.wikimedia.org/wiki/Commons:Project_scope"
                target="_blank"
              >
                https://commons.wikimedia.org/wiki/Commons:Project_scope
              </a>
            }
          />
          <Dropdown
            className="import-dropdown"
            inline
            direction="left"
            options={
              articleForms.length > 0
                ? articleForms.map(({ form }, index) => ({
                    text: (
                      <Popup
                        position="bottom right"
                        trigger={
                          <div
                            onClick={() => {
                              updateField({
                                ...form,
                                title: form.fileTitle,
                                saveTemplate: false,
                                categories: form.categories.map((category) => ({
                                  title: category,
                                })),
                              });
                            }}
                          >
                            <h4>
                              {form.fileTitle.length > 30
                                ? `${form.fileTitle.substring(0, 30)}...`
                                : form.fileTitle}
                            </h4>
                            <p style={{ fontWeight: 200 }}>
                              {form.description.length > 30
                                ? `${form.description.substring(0, 30)}...`
                                : form.description}
                            </p>
                          </div>
                        }
                        content={form.fileTitle}
                      />
                    ),
                    value: form,
                    key: form.fileTitle + index,
                  }))
                : [
                    {
                      text: t("UploadFileInfoModal.nothing_to_show"),
                      value: "",
                    },
                  ]
            }
            icon={
              <Popup
                position="bottom right"
                trigger={<Icon name="share" />}
                content={
                  <p>{t("UploadFileInfoModal.import_previous_form_details")}</p>
                }
              />
            }
          />
        </div>
      </Modal.Header>

      <Modal.Content>
        {!standalone && uploadProgress < 100 && (
          <Progress
            className="c-upload-progress"
            percent={Math.floor(uploadProgress)}
            progress
            indicating
          />
        )}
        {_renderFilePreview()}
        {_renderFileForm()}
      </Modal.Content>
    </Modal>
  );
};

export default UploadFileInfoModal;

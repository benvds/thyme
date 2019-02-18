// @flow

import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';

import isSameDay from 'date-fns/is_same_day';

import Label from 'semantic-ui-react/dist/commonjs/elements/Label';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Popup from 'semantic-ui-react/dist/commonjs/modules/Popup';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal';
import Confirm from 'semantic-ui-react/dist/commonjs/addons/Confirm';

import { timeElapsed } from 'core/thyme';
import { formatTime, formatDate } from 'core/intl';
import { treeDisplayName } from 'core/projects';

import { useResponsive } from 'components/Responsive';

import { sortedProjects } from 'sections/Projects/selectors';

import EditableEntry from './EditableEntry';

import './ListEntry.css';

type ListEntryProps = {
  entry: TimeType;
  project: ProjectTreeWithTimeType;
  enabledNotes: boolean;
  enabledProjects: boolean;
  enabledEndDate: boolean;
  round: Rounding;
  roundAmount: number;
  onRemove: (entry: TimeType | TimePropertyType) => void;
  onEntryUpdate: (entry: TimePropertyType) => void;
  onAddProject: (project: string) => string;
};

function useToggle() {
  const [toggled, setToggled] = useState<boolean>(false);

  const on = useCallback(() => setToggled(true), []);
  const off = useCallback(() => setToggled(false), []);
  const toggle = useCallback(() => setToggled(!toggled), [toggled]);

  return [toggled, on, off, toggle];
}

function ListEntry(props: ListEntryProps) {
  const {
    entry,
    project,
    round,
    roundAmount,
    enabledNotes,
    enabledProjects,
    enabledEndDate,
    onRemove,
    onEntryUpdate,
    onAddProject,
  } = props;
  const {
    start,
    end,
    notes,
  } = entry;

  const [isMobile] = useResponsive({ max: 'tablet' });
  const [confirmOpen, openConfirm, closeConfirm] = useToggle();
  const [popupOpen, openPopup, closePopup] = useToggle();
  const [editOpen, openEdit, closeEdit] = useToggle();

  const onHandleOpenEdit = useCallback(() => {
    closePopup();
    openEdit();
  }, [closePopup, openEdit]);
  const onHandleRemove = useCallback(() => {
    closePopup();
    closeEdit();
    openConfirm();
  }, [closePopup, openConfirm]);

  const onConfirmRemove = useCallback(() => onRemove(entry), [entry]);
  const onHandleEdit = useCallback((e) => {
    if (
      e.target
      && (e.target.classList.contains('button') || e.target.classList.contains('popup'))
    ) {
      e.preventDefault();
      return;
    }

    openEdit();
  }, [openEdit]);

  const duration = timeElapsed(start, end, false, false, round, roundAmount);
  const showDates = !isSameDay(start, end);

  const Buttons = (
    <Button.Group fluid>
      <Button
        icon="edit"
        basic
        color="grey"
        content="Edit entry"
        onClick={onHandleOpenEdit}
      />
      <Button
        basic
        icon="remove"
        onClick={onHandleRemove}
        color="red"
        content="Remove entry"
      />
    </Button.Group>
  );

  return (
    <div className="ListEntry" role="presentation" onClick={onHandleEdit}>
      {((enabledProjects && project) || enabledNotes) && (
        <div className="ListEntry__ProjectNotes">
          {enabledProjects && project && (
            <div className="ListEntry__Project">
              <Label>
                {treeDisplayName(project)}
              </Label>
            </div>
          )}
          {enabledNotes && (
            <div className="ListEntry__Notes">
              {notes || <span className="ListEntry__NotesEmpty">(no notes)</span>}
            </div>
          )}
        </div>
      )}
      <div className="ListEntry__TimeDuration">
        <div className="ListEntry__Time">
          {showDates && <span className="ListEntry__DateValue">{formatDate(start)}</span>}
          <span className="ListEntry__TimeValue">{formatTime(start)}</span>
          <span className="ListEntry__TimeSeparator">→</span>
          {showDates && <span className="ListEntry__DateValue">{formatDate(end)}</span>}
          <span className="ListEntry__TimeValue">{formatTime(end)}</span>
        </div>
        <div className="ListEntry__Duration">
          {duration}
        </div>
        {!isMobile && (
          <div className="ListEntry__Actions">
            <Popup
              flowing
              open={popupOpen}
              onOpen={openPopup}
              onClose={closePopup}
              trigger={(
                <Button
                  style={{ opacity: 0.6 }}
                  icon="ellipsis vertical"
                  size="small"
                  circular
                  basic
                />
              )}
              on="click"
              position="left center"
              content={Buttons}
            />
          </div>
        )}
      </div>
      {isMobile && (
        <div className="ListEntry__Actions">
          {Buttons}
        </div>
      )}

      <Confirm
        open={confirmOpen}
        content="Are you sure you want to remove this entry?"
        confirmButton="Remove entry"
        size="mini"
        onCancel={closeConfirm}
        onConfirm={onConfirmRemove}
      />

      {editOpen && (
        <Modal
          open={editOpen}
          onClose={closeEdit}
          size="small"
        >
          <Modal.Content>
            <EditableEntry
              entry={entry}
              enabledEndDate={enabledEndDate}
              enabledNotes={enabledNotes}
              enabledProjects={enabledProjects}
              onUpdate={onEntryUpdate}
              onAddNewProject={onAddProject}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button
              icon="remove"
              onClick={onHandleRemove}
              color="red"
              content="Remove entry"
            />
            <Button
              icon="window close"
              onClick={closeEdit}
              content="Close"
            />
          </Modal.Actions>
        </Modal>
      )}

    </div>
  );
}

function mapStateToProps(state: StateShape, ownProps: ListEntryProps) {
  const projects = sortedProjects(state);
  const project = projects.find(item => item.id === ownProps.entry.project);

  return {
    project,
  };
}

export default connect(mapStateToProps)(ListEntry);

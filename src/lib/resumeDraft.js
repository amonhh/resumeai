let _draft = null;

export function setResumeDraft(data) {
  _draft = data;
}

export function getResumeDraft() {
  return _draft;
}

export function clearResumeDraft() {
  _draft = null;
}

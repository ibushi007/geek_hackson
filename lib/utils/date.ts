/**
 * 今日の日付をISO形式（YYYY-MM-DD）で取得
 * @returns YYYY-MM-DD形式の日付文字列
 */
export const getTodayISODate = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * 日付をISO形式（YYYY-MM-DD）で取得
 * @param date - Date オブジェクト
 * @returns YYYY-MM-DD形式の日付文字列
 */
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * ISO形式の日付文字列から日本語表記に変換
 * @param isoDate - YYYY-MM-DD形式の日付文字列
 * @returns YYYY年MM月DD日形式の文字列
 */
export const formatISOToJapanese = (isoDate: string): string => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

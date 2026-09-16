/**
 * Converts a numerical amount in INR into official Indian English words
 * E.g., 96500 -> "Rupees Ninety Six Thousand Five Hundred Only"
 */
export function numberToIndianRupeesWords(num) {
  if (num === null || num === undefined || isNaN(num)) return "Rupees Zero Only";
  const n = Math.round(Number(num));
  if (n === 0) return "Rupees Zero Only";

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertChunk = (val) => {
    let str = '';
    if (val >= 100) {
      str += ones[Math.floor(val / 100)] + ' Hundred ';
      val %= 100;
    }
    if (val >= 20) {
      str += tens[Math.floor(val / 10)] + ' ';
      val %= 10;
    }
    if (val > 0) {
      str += ones[val] + ' ';
    }
    return str.trim();
  };

  let remaining = n;
  let crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  let lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  let thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  let hundredsAndBelow = remaining;

  let result = '';
  if (crore > 0) result += convertChunk(crore) + ' Crore ';
  if (lakh > 0) result += convertChunk(lakh) + ' Lakh ';
  if (thousand > 0) result += convertChunk(thousand) + ' Thousand ';
  if (hundredsAndBelow > 0) result += convertChunk(hundredsAndBelow) + ' ';

  return 'Rupees ' + result.trim() + ' Only';
}

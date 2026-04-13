export const sendResponse = <T>(res: any, payload: { statusCode: number; success: boolean; message: string; data?: T }) => {
  return res.status(payload.statusCode).json(payload);
};

import {beforeEach,describe,it,expect,vi} from 'vitest';import {render,screen,fireEvent} from '@testing-library/react';import {EmailActionPage} from './EmailActionPage';
const sdk=vi.hoisted(()=>({check:vi.fn(),apply:vi.fn(),auth:{currentUser:null}}));vi.mock('firebase/auth',()=>({checkActionCode:sdk.check,applyActionCode:sdk.apply}));vi.mock('../../app/firebase',()=>({auth:sdk.auth}));vi.mock('../../i18n/useTranslation',()=>({useTranslation:()=>({locale:'en',t:(key:string)=>key})}));
describe('custom email actions preserve email verification',()=>{
 beforeEach(()=>{vi.resetAllMocks();history.replaceState(null,'','/auth/action?mode=verifyEmail&oobCode=disposable-code');});
 it('validates operation before confirmation and strips codes',async()=>{sdk.check.mockResolvedValue({operation:'VERIFY_EMAIL'});render(<EmailActionPage/>);fireEvent.click(await screen.findByRole('button',{name:'Confirm'}));expect(await screen.findByRole('status')).toHaveTextContent('saved');expect(sdk.apply).toHaveBeenCalledWith(sdk.auth,'disposable-code');expect(location.search).toBe('');});
 it('rejects a mismatched operation',async()=>{sdk.check.mockResolvedValue({operation:'PASSWORD_RESET'});render(<EmailActionPage/>);expect(await screen.findByRole('alert')).toHaveTextContent('invalid, expired');expect(sdk.apply).not.toHaveBeenCalled();});
 it('rejects expired verification codes',async()=>{sdk.check.mockRejectedValue({code:'auth/expired-action-code'});render(<EmailActionPage/>);expect(await screen.findByRole('alert')).toHaveTextContent('expired');});
});

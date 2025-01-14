import {mountWithTheme} from 'sentry-test/enzyme';

import {createTeam} from 'sentry/actionCreators/teams';
import CreateTeamModal from 'sentry/components/modals/createTeamModal';

jest.mock('sentry/actionCreators/teams', () => ({
  createTeam: jest.fn((...args) => new Promise(resolve => resolve(...args))),
}));

describe('CreateTeamModal', function () {
  const org = TestStubs.Organization();
  const closeModal = jest.fn();
  const onClose = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(function () {
    onClose.mockReset();
    onSuccess.mockReset();
  });

  afterEach(function () {});

  it('calls createTeam action creator on submit', async function () {
    const wrapper = mountWithTheme(
      <CreateTeamModal
        Body={p => p.children}
        Header={p => p.children}
        organization={org}
        closeModal={closeModal}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
      TestStubs.routerContext()
    );

    wrapper
      .find('CreateTeamForm Input[name="slug"]')
      .simulate('change', {e: {target: {value: 'new-team'}}});

    wrapper.find('CreateTeamForm Form').simulate('submit');

    expect(createTeam).toHaveBeenCalledTimes(1);
    await tick();
    expect(onClose).toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
